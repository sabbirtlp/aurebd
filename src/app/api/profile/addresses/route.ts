import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    return NextResponse.json(user.addresses || []);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    
    const newAddress = {
      ...body,
      isDefault: user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json(user.addresses);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;
    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    
    const addressIndex = user.addresses.findIndex((a: any) => a._id.toString() === id);
    if (addressIndex > -1) {
      user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updateData };
      await user.save();
    }

    return NextResponse.json(user.addresses);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== id);
    await user.save();

    return NextResponse.json(user.addresses);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
