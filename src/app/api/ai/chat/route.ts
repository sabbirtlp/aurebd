import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendAdminOrderNotification } from "@/lib/email";

// --------------------
// DATA FETCHERS
// --------------------

async function getSiteKnowledge() {
  try {
    await dbConnect();

    // 1. Products
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name price discountPrice")
      .lean();
    const productList = products
      .map((p) => `- ${p.name}: ৳${p.discountPrice || p.price}`)
      .join("\n");

    // 2. About page content
    const aboutData = await SiteContent.find({ page: "about" }).lean();
    const aboutSummary = aboutData
      .map((item) => `${item.section}.${item.key}: ${item.value.substring(0, 500)}`)
      .join("\n");

    // 3. General site content (home, contact, etc.)
    const siteData = await SiteContent.find({ page: { $ne: "about" } }).limit(10).lean();
    const siteSummary = siteData
      .map((item) => `${item.page}.${item.section}.${item.key}: ${item.value.substring(0, 300)}`)
      .join("\n");

    return { productList, aboutSummary, siteSummary };
  } catch (error) {
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", aboutSummary: "", siteSummary: "" };
  }
}

async function callProvider(url: string, apiKey: string, body: any, isOpenRouter = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const headers: any = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://aureabd.com";
      headers["X-Title"] = "AureaBD";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    clearTimeout(timeoutId);
    return "";
  }
}

async function processAIResponse(text: string) {
  if (!text) return text;
  
  // Check if AI generated an order info block
  const orderRegex = /\[ORDER_INFO:\s*(\{[\s\S]*?\})\s*\]/;
  const match = text.match(orderRegex);
  
  if (match) {
    try {
      await dbConnect();
      const orderData = JSON.parse(match[1]);
      const rawProductName = (orderData.productName || "").trim();
      const rawFullName = (orderData.fullName || "").toString().trim();
      const rawPhone = (orderData.phone || "").toString().trim();
      const rawAddress = (orderData.address || "").toString().trim();
      const rawEmail = (orderData.email || "").toString().trim();

      const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, "");
      const hasValidName = rawFullName && rawFullName.toLowerCase() !== "n/a" && rawFullName.toLowerCase() !== "chat customer" && rawFullName.length >= 2;
      const hasValidPhone = rawPhone && cleanPhoneDigits.length >= 10;
      const hasValidAddress = rawAddress && rawAddress.toLowerCase() !== "n/a" && rawAddress.length >= 4;

      // STRICT VALIDATION: Cannot place order without valid Name, Phone, and Address
      if (!hasValidName || !hasValidPhone || !hasValidAddress) {
        console.warn("Blocked order due to missing customer details:", { rawFullName, rawPhone, rawAddress });
        text = text.replace(orderRegex, "").trim();

        const missingFields: string[] = [];
        if (!hasValidName) missingFields.push("আপনার সম্পূর্ণ নাম");
        if (!hasValidPhone) missingFields.push("সচল মোবাইল নাম্বার");
        if (!hasValidAddress) missingFields.push("সম্পূর্ণ ডেলিভারি ঠিকানা (গ্রাম/রোড, থানা ও জেলা)");

        text += `\n\n📌 **অর্ডারটি সফলভাবে কনফার্ম করতে অনুগ্রহ করে বাকি তথ্যগুলো দিন:**\n${missingFields.map(f => `👉 ${f}`).join("\n")}`;
        return text;
      }

      const escapedName = rawProductName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let product = null;
      if (escapedName) {
        product = await Product.findOne({
          $or: [
            { name: { $regex: new RegExp(escapedName, "i") } },
            { name_bn: { $regex: new RegExp(escapedName, "i") } }
          ]
        });
      }
      
      if (!product && rawProductName) {
        const words = rawProductName.split(/\s+/).filter((w: string) => w.length > 2);
        for (const word of words) {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          product = await Product.findOne({
            $or: [
              { name: { $regex: new RegExp(escapedWord, "i") } },
              { name_bn: { $regex: new RegExp(escapedWord, "i") } }
            ]
          });
          if (product) break;
        }
      }

      if (product) {
        // Link or create guest user
        let userId = undefined;
        const phone = rawPhone;
        const email = rawEmail;
        const fullName = rawFullName;

        if (phone || email) {
          let user = null;
          if (phone) user = await User.findOne({ phone });
          if (!user && email) user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: fullName,
              phone: phone || undefined,
              role: 'user',
              email: email || `${phone || Date.now()}@aureabd.temp`
            });
          }
          userId = user._id;
        }

        const price = product.discountPrice || product.price;

        // Create the order
        const order = await Order.create({
          user: userId,
          items: [{
            product: product._id,
            name: product.name,
            price: price,
            quantity: 1,
            image: product.image || ""
          }],
          totalAmount: price,
          shippingAddress: {
            fullName: fullName,
            address: rawAddress,
            division: orderData.division || "N/A",
            district: orderData.district || "N/A",
            city: orderData.city || orderData.district || "Bangladesh",
            phone: phone,
            email: email || undefined
          },
          paymentMethod: 'Cash on Delivery',
          status: 'Pending'
        });

        console.log("Chatbot Order Created Successfully:", order._id);

        // Decrement stock and increment sold count
        try {
          await Product.findByIdAndUpdate(product._id, {
            $inc: { stock: -1, soldCount: 1 }
          });
        } catch (stockErr) {
          console.error("Failed to update stock:", stockErr);
        }

        // Send email notification to admin
        try {
          await sendAdminOrderNotification(order);
          console.log("Admin notification email sent successfully for order:", order._id);
        } catch (e) {
          console.error("Email notification failed for AI order:", e);
        }

        // Clean up text and add success message
        text = text.replace(orderRegex, "").trim();
        text += `\n\n✅ **আপনার অর্ডারটি সফলভাবে আমাদের সিস্টেমে এন্ট্রি করা হয়েছে! (অর্ডার আইডি: #${order._id.toString().slice(-6).toUpperCase()})**\nখুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করে ডেলিভারি কনফার্ম করবেন।`;
      } else {
        console.warn("Product not found for chatbot orderData:", orderData);
        text = text.replace(orderRegex, "").trim();
      }
    } catch (error) {
      console.error("Order processing from AI failed:", error);
      text = text.replace(orderRegex, "").trim();
    }
  }
  
  return text;
}

// --------------------
// MAIN HANDLER
// --------------------

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { productList, aboutSummary, siteSummary } = await getSiteKnowledge();

    const userMessages = messages.filter((m: any) => m.role === "user");
    const isFirstMessage = userMessages.length <= 1;
    const lastUserMsg = userMessages[userMessages.length - 1]?.content?.toLowerCase() || "";
    const hasSalam = lastUserMsg.includes("salam") || lastUserMsg.includes("সালাম") || lastUserMsg.includes("আসসালামু");

    let salamInstruction = "";
    if (isFirstMessage) {
      if (hasSalam) {
        salamInstruction = `\n🤝 গ্রাহক সালাম দিয়েছেন। উত্তরের শুরুতে "ওয়ালাইকুম আসসালাম!" দিয়ে শুরু করুন। তারপর স্বাভাবিকভাবে কথা বলুন।`;
      } else {
        salamInstruction = `\n🤝 এটি গ্রাহকের প্রথম মেসেজ। উত্তরের শুরুতে "আসসালামু আলাইকুম! Aurea BD-তে আপনাকে স্বাগতম 🌸" দিয়ে শুরু করুন। তারপর স্বাভাবিকভাবে কথা বলুন।`;
      }
    } else {
      salamInstruction = `\n🤝 এটি প্রথম মেসেজ নয়। সালাম বা স্বাগতম জানানোর দরকার নেই। সরাসরি উত্তর দিন।`;
    }

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ প্রিমিয়াম স্কিনকেয়ার বিশেষজ্ঞ ও কনসাল্টেন্ট।

⚠️ ভাষা: সবসময় প্রাকৃতিক বাংলায় উত্তর দিন। English-এ উত্তর দেওয়া নিষেধ। তবে পণ্যের নাম এবং ক্যাটাগরি (Face Wash, Toner, Serum, Cream) ইংরেজিতেই থাকবে।
${salamInstruction}

পণ্য তালিকা:
${productList}

Aurea BD সম্পর্কে (About Us):
${aboutSummary}

সাইট তথ্য:
${siteSummary}
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।

নিয়মাবলী:
১. উপরের পণ্য তালিকা, About Us এবং সাইট তথ্য ব্যবহার করে উত্তর দিন। কাল্পনিক তথ্য দেবেন না।
২. পণ্যের নাম ও ক্যাটাগরি ENGLISH-এ রাখুন।
৩. বাক্য সাবলীল, মার্জিত ও পেশাদার হবে।
৪. 🛑 **অর্ডার সংক্রান্ত গুরুত্বপূর্ণ নিয়ম (আবশ্যক)**:
   - কাস্টমার যদি কোনো পণ্য অর্ডার করতে চায় বা কিনতে চায়, তবে অর্ডার সম্পন্ন করার জন্য অবশ্যই এই ৩টি তথ্য আবশ্যক:
     ১. কাস্টমারের সম্পূর্ণ নাম
     ২. সচল মোবাইল নাম্বার (১১ ডিজিট)
     ৩. সম্পূর্ণ ডেলিভারি ঠিকানা (রোড/গ্রাম, থানা ও জেলা)
   - যদি কাস্টমার এই ৩টি তথ্যের যেকোনো একটিও না দেয় (বা আংশিক তথ্য দেয়), তবে অর্ডার চূড়ান্ত করবেন না। তাকে বিনয়ের সাথে অনুপস্থিত তথ্যগুলো দিতে বলুন।
৫. ⚠️ **অটোরিকুয়েস্ট রুল (খুব সতর্ক)**:
   - কাস্টমার যদি নির্দিষ্ট পণ্যের নাম, তার নিজের নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা — এই **৪টি তথ্যই স্পষ্টভাবে প্রদান করে**, কেবল তখনই এবং শুধুমাত্র তখনই আপনার উত্তরের একদম শেষে নিচের JSON ব্লকটি যুক্ত করবেন:
[ORDER_INFO: {"productName": "পণ্যের নাম", "fullName": "কাস্টমারের নাম", "phone": "ফোন নাম্বার", "address": "ঠিকানা"}]
   - **সতর্কতা**: নাম, ফোন বা ঠিকানার যেকোনো একটি মিসিং থাকলে কোনোভাবেই [ORDER_INFO: ...] ব্লক যোগ করবেন না!
৬. তথ্য না থাকলে বিনয়ের সাথে জানান।

মনে রাখুন: আপনি সবসময় বাংলায় কথা বলবেন।`;

    const contextMessages = messages.filter((m: any) => m.content).slice(-6);
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // 1. Try OpenRouter Gemini 2.0
    if (openRouterKey) {
      let res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: await processAIResponse(res) });

      res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: await processAIResponse(res) });
    }

    // 2. Try Groq Llama 3.3 70B
    if (groqKey) {
      const res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      });
      if (res) return NextResponse.json({ text: await processAIResponse(res) });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে সাড়া দিতে পারছি না।" });
  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ text: "সিস্টেম এরর" }, { status: 500 });
  }
}