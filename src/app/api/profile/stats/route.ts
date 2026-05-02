export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if user has password
    const user = await User.findById((session.user as any).id).select('password');
    const hasPassword = !!user?.password;

    // Fetch stats
    const orders = await Order.find({ user: (session.user as any).id });
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "Pending").length;
    const completedOrders = orders.filter(o => o.status === "Delivered").length;
    const totalSpent = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const recentOrders = await Order.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      hasPassword,
      stats: [
        { label: "Total Orders", value: totalOrders.toString().padStart(2, '0') },
        { label: "Pending", value: pendingOrders.toString().padStart(2, '0') },
        { label: "Completed", value: completedOrders.toString().padStart(2, '0') },
        { label: "Total Spent", value: `৳ ${totalSpent.toLocaleString()}` },
      ],
      recentOrders: recentOrders.map((o: any) => ({
        id: `#ORD-${o._id.toString().slice(-6).toUpperCase()}`,
        date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: o.status,
        total: `৳ ${o.totalAmount.toLocaleString()}`,
        _id: o._id.toString()
      }))
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

