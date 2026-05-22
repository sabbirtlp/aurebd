import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    let userId;
    let session = await getServerSession(authOptions);

    await dbConnect();
    const body = await req.json();
    const { items, totalAmount, shippingAddress, paymentMethod } = body;

    if (session) {
      userId = session.user.id;
    } else {
      // Guest Checkout - Create or find user by email or phone
      const { fullName, email, phone } = shippingAddress;
      
      if (!phone && !email) {
        return NextResponse.json({ message: "ফোন নম্বর অথবা ইমেইল প্রয়োজন" }, { status: 400 });
      }
      
      let user = null;
      
      // Try to find by email first, then by phone
      if (email) {
        user = await User.findOne({ email });
      }
      if (!user && phone) {
        user = await User.findOne({ phone });
      }
      
      if (!user) {
        // Create a new user without a password (they can set it later)
        const userData: any = {
          name: fullName,
          phone,
          role: 'user',
          email: email || `${phone || Date.now()}@aureabd.temp`
        };
        
        user = await User.create(userData);
      }
      userId = user._id;
    }

    // Create the order
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Send admin notification (Awaited to ensure Vercel sends it)
    try {
      await sendAdminOrderNotification(order);
    } catch (err) {
      console.error("Email notification failed:", err);
    }

    // Decrement stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // If admin, return all orders, else return user's orders
    let orders;
    if (session.user.role === "admin") {
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
