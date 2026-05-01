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
      message: "Success! Email sent. Please check official.aureabd@gmail.com" 
    });
  } catch (error: any) {
    console.error("Test email error details:", error);
    return NextResponse.json({ 
      success: false, 
      message: "EMAIL FAILED",
      error: error.message,
      code: error.code,
      command: error.command
    }, { status: 500 });
  }
}
