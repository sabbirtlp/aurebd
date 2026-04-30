import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o: any) => ({
      id: `#ORD-${o._id.toString().slice(-6).toUpperCase()}`,
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: o.status,
      total: `৳ ${o.totalAmount.toLocaleString()}`,
      items: o.items.length,
      _id: o._id.toString()
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
