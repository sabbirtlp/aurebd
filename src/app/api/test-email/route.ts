import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const testOrder = {
      _id: "TEST-ID-123",
      items: [
        { name: "Test Premium Serum", quantity: 1, price: 2500 },
        { name: "Luxury Sakura Cream", quantity: 2, price: 1800 }
      ],
      totalAmount: 6100,
      shippingAddress: {
        fullName: "Test Customer",
        phone: "01700000000",
        address: "123 Test Street",
        city: "Dhaka"
      },
      paymentMethod: "Test/Manual"
    };

    console.log("Starting test email...");
    await sendAdminOrderNotification(testOrder);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email trigger successful! Please check official.aureabd@gmail.com (and Spam folder)." 
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to send test email." 
    }, { status: 500 });
  }
}
