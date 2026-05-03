import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

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

// POST — bulk upsert site content
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        message: "Unauthorized", 
        role: session?.user?.role 
      }, { status: 401 });
    }

    await dbConnect();
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { items } = body; // Array of { page, section, key, value, language }
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ message: "Items array is required" }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true, message: "No items to update" });
    }

    const operations = items.map((item: any) => {
      if (!item.page || !item.section || !item.key) {
        throw new Error(`Missing required fields for item: ${JSON.stringify(item)}`);
      }
      return {
        updateOne: {
          filter: { 
            page: item.page, 
            section: item.section, 
            key: item.key, 
            language: item.language || "en" 
          },
          update: { $set: { value: item.value } },
          upsert: true,
        },
      };
    });

    await SiteContent.bulkWrite(operations);
    revalidateTag("cms");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, message: "Content updated successfully" });
  } catch (error) {
    console.error("PUT /api/admin/content Error:", error);
    return NextResponse.json({ 
      message: "Failed to update content", 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
