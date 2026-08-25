import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE?.toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

export const sendAdminOrderNotification = async (order: any) => {
  const adminEmail = "official.aureabd@gmail.com";
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rawPhone = order.shippingAddress?.phone || "";
  const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, "");
  const formattedBdPhone = cleanPhoneDigits.startsWith("880")
    ? cleanPhoneDigits
    : cleanPhoneDigits.startsWith("0")
    ? `88${cleanPhoneDigits}`
    : cleanPhoneDigits.length === 10
    ? `880${cleanPhoneDigits}`
    : cleanPhoneDigits;
  
  const whatsappUrl = formattedBdPhone ? `https://wa.me/${formattedBdPhone}` : "";
  const callUrl = rawPhone ? `tel:${rawPhone}` : "";
  const adminUrl = `${process.env.NEXTAUTH_URL || "https://aureabd.com"}/admin/orders`;

  const isAiOrder = !order.shippingAddress?.division || order.shippingAddress?.division === "N/A";

  const itemsHtml = order.items.map((item: any) => {
    const itemTotal = (item.price * item.quantity).toLocaleString();
    const itemImg = item.image
      ? `<img src="${item.image}" alt="${item.name}" width="54" height="54" style="width: 54px; height: 54px; object-fit: cover; border-radius: 8px; border: 1px solid #eeddd4; margin-right: 14px; vertical-align: middle;" />`
      : `<div style="width: 54px; height: 54px; background: #fdf6f0; border-radius: 8px; border: 1px solid #eeddd4; display: inline-block; text-align: center; line-height: 54px; font-size: 20px; margin-right: 14px; vertical-align: middle;">✨</div>`;

    return `
      <tr>
        <td style="padding: 16px 12px; border-bottom: 1px solid #f2e9e4;">
          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              <td style="width: 60px; vertical-align: middle;">
                ${itemImg}
              </td>
              <td style="vertical-align: middle;">
                <div style="font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.3;">${item.name}</div>
                <div style="font-size: 12px; color: #8a7a72; margin-top: 4px;">
                  Qty: <strong style="color: #c08065;">${item.quantity}</strong> × ৳ ${item.price.toLocaleString()}
                </div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #f2e9e4; text-align: right; vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #1e293b;">৳ ${itemTotal}</span>
        </td>
      </tr>
    `;
  }).join('');

  const fullAddress = [
    order.shippingAddress.address,
    order.shippingAddress.policeStation,
    order.shippingAddress.district !== "N/A" ? order.shippingAddress.district : "",
    order.shippingAddress.division !== "N/A" ? order.shippingAddress.division : "",
    order.shippingAddress.city && order.shippingAddress.city !== "Bangladesh" && order.shippingAddress.city !== "N/A" ? order.shippingAddress.city : "",
  ].filter(Boolean).join(", ");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order #${orderId} - Aurea BD</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
      
      <!-- WRAPPER -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f6f3; padding: 30px 10px;">
        <tr>
          <td align="center">
            
            <!-- CONTAINER -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06); border: 1px solid #eee7e2;">
              
              <!-- LUXURY HEADER -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e1b18 0%, #2a2421 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #c08065;">
                  <div style="letter-spacing: 5px; font-size: 24px; font-weight: 800; color: #fdfaf7; margin: 0; text-transform: uppercase;">
                    A U R E A &nbsp; B D
                  </div>
                  <div style="color: #c08065; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px;">
                    Luxury Skincare Concierge
                  </div>
                </td>
              </tr>

              <!-- STATUS BADGE & ORDER INTRO -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <span style="display: inline-block; background-color: #fdf3ee; color: #c08065; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #f5ded3;">
                          ${isAiOrder ? "🤖 Chatbot AI Order" : "🛍️ Web Store Order"}
                        </span>
                      </td>
                      <td align="right" style="font-size: 12px; color: #94a3b8;">
                        ${orderDate}
                      </td>
                    </tr>
                  </table>

                  <h1 style="margin: 18px 0 6px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                    New Order Received! 🌟
                  </h1>
                  <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                    Order <strong style="color: #0f172a; font-family: monospace; font-size: 15px;">#ORD-${orderId}</strong> has been successfully placed.
                  </p>
                </td>
              </tr>

              <!-- CUSTOMER DETAILS CARD -->
              <tr>
                <td style="padding: 0 30px 24px 30px;">
                  <div style="background-color: #faf7f5; border-radius: 12px; padding: 22px; border: 1px solid #efe8e3;">
                    <div style="font-size: 11px; font-weight: 700; color: #a18a7e; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
                      👤 Customer Information
                    </div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.6;">
                      <tr>
                        <td style="padding: 4px 0; width: 110px; color: #8a7a72; font-weight: 500;">Full Name:</td>
                        <td style="padding: 4px 0; color: #1e293b; font-weight: 700;">${order.shippingAddress.fullName || "Guest Customer"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #8a7a72; font-weight: 500;">Phone:</td>
                        <td style="padding: 4px 0;">
                          <a href="${callUrl}" style="color: #c08065; font-weight: 700; text-decoration: none;">${order.shippingAddress.phone}</a>
                        </td>
                      </tr>
                      ${order.shippingAddress.email ? `
                      <tr>
                        <td style="padding: 4px 0; color: #8a7a72; font-weight: 500;">Email:</td>
                        <td style="padding: 4px 0; color: #475569;">${order.shippingAddress.email}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 4px 0; color: #8a7a72; font-weight: 500; vertical-align: top;">Delivery Address:</td>
                        <td style="padding: 4px 0; color: #1e293b; font-weight: 600;">${fullAddress || order.shippingAddress.address}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #8a7a72; font-weight: 500;">Payment:</td>
                        <td style="padding: 4px 0;">
                          <span style="display: inline-block; background-color: #e2e8f0; color: #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                            ${order.paymentMethod || 'Cash on Delivery'}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- QUICK ACTION BUTTONS (CALL & WHATSAPP) -->
                    ${rawPhone ? `
                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e4d7cf; display: flex; gap: 8px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          ${whatsappUrl ? `
                          <td style="padding-right: 8px;">
                            <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 6px;">
                              💬 WhatsApp Customer
                            </a>
                          </td>
                          ` : ''}
                          <td>
                            <a href="${callUrl}" style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 6px;">
                              📞 Call Now
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                    ` : ''}
                  </div>
                </td>
              </tr>

              <!-- ORDER ITEMS TABLE -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="font-size: 11px; font-weight: 700; color: #a18a7e; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                    🛍️ Ordered Products (${order.items.length})
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #fdfbf9; border-bottom: 2px solid #ecdcd4;">
                        <th align="left" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #8a7a72; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                        <th align="right" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #8a7a72; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                      
                      <!-- GRAND TOTAL -->
                      <tr style="background-color: #faf7f5;">
                        <td style="padding: 18px 12px; font-size: 16px; font-weight: 800; color: #0f172a;">
                          Grand Total Amount
                        </td>
                        <td style="padding: 18px 12px; text-align: right; font-size: 20px; font-weight: 900; color: #c08065;">
                          ৳ ${order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- DASHBOARD CTA BUTTON -->
              <tr>
                <td align="center" style="padding: 10px 30px 36px 30px;">
                  <a href="${adminUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #c08065 0%, #a46850 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 14px rgba(192, 128, 101, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                    View in Admin Dashboard &rarr;
                  </a>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #faf7f5; padding: 24px 30px; text-align: center; border-top: 1px solid #efe8e3; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
                    &copy; ${new Date().getFullYear()} Aurea BD. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px;">
                    This is an automated priority alert sent directly from your e-commerce platform.
                  </p>
                </td>
              </tr>

            </table>
            <!-- /CONTAINER -->

          </td>
        </tr>
      </table>
      <!-- /WRAPPER -->

    </body>
    </html>
  `;

  // Send the email
  await transporter.sendMail({
    from: `"Aurea BD Official" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🛒 [New Order] #ORD-${orderId} | ৳ ${order.totalAmount.toLocaleString()} - ${order.shippingAddress.fullName || "Customer"}`,
    html: html,
  });
  console.log("Admin notification email sent successfully for order:", orderId);
};
