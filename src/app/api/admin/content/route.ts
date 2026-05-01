import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// GET all site content
export async function GET() {
  try {
    await dbConnect();
    const content = await SiteContent.find({}).lean();
    return NextResponse.json({ content: JSON.parse(JSON.stringify(content)) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch content" }, { status: 500 });
  }
}

// PUT — bulk upsert site content
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("PUT Session:", session);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized", role: session?.user?.role }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { items } = body; // Array of { page, section, key, value, language }

    const operations = items.map((item: any) => ({
      updateOne: {
        filter: { page: item.page, section: item.section, key: item.key, language: item.language || "en" },
        update: { $set: { value: item.value } },
        upsert: true,
      },
    }));

    await SiteContent.bulkWrite(operations);
    return NextResponse.json({ success: true, message: "Content updated" });
  } catch (error) {
    console.error("PUT /api/admin/content Error:", error);
    return NextResponse.json({ message: "Failed to update content", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
