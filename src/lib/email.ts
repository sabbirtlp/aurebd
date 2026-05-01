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
  
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <small style="color: #666;">Qty: ${item.quantity} × ৳ ${item.price.toLocaleString()}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ৳ ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .card { background: #fff; border-radius: 12px; border: 1px solid #eee; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .title { background: #cba394; color: white; padding: 20px; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 30px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total-row { font-size: 18px; font-weight: bold; color: #cba394; }
        .button { display: inline-block; padding: 14px 28px; background: #cba394; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #1a1a2e; margin: 0;">AUREA BD</h1>
          <p style="color: #cba394; margin: 5px 0; letter-spacing: 3px;">PREMIUM COSMETICS</p>
        </div>
        
        <div class="card">
          <h2 class="title">New Order Received!</h2>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new order has been placed on <strong>Aurea BD</strong>. Here are the details:</p>
            
            <table class="table">
              ${itemsHtml}
              <tr class="total-row">
                <td style="padding: 12px; border-top: 2px solid #cba394;">Total Amount</td>
                <td style="padding: 12px; border-top: 2px solid #cba394; text-align: right;">৳ ${order.totalAmount.toLocaleString()}</td>
              </tr>
            </table>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; font-size: 14px; color: #666; text-transform: uppercase;">Customer Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>

            <center>
              <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="button">View in Dashboard</a>
            </center>
          </div>
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} Aurea BD. All rights reserved.<br/>
          This is an automated notification from your website.
        </div>
      </div>
    </body>
    </html>
  `;

  // Send the email
  await transporter.sendMail({
    from: `"Aurea BD Official" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Order Notification: #ORD-${order._id.toString().slice(-6).toUpperCase()} | ৳ ${order.totalAmount.toLocaleString()}`,
    html: html,
  });
  console.log("Admin notification email sent successfully");
};
