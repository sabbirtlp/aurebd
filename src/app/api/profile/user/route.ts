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
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("PATCH Profile: No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    console.log("PATCH Profile: Updating user", { userId, userEmail, bodyName: body.name });
    
    await dbConnect();
    
    // Try updating by ID first, then by email as fallback
    let updatedUser;
    if (userId) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          name: body.name,
          phone: body.phone,
          gender: body.gender,
          image: body.image
        },
        { new: true, runValidators: true }
      );
    }

    if (!updatedUser && userEmail) {
      console.log("PATCH Profile: ID update failed or no ID, trying email fallback");
      updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { 
          name: body.name,
          phone: body.phone,
          gender: body.gender,
          image: body.image
        },
        { new: true, runValidators: true }
      );
    }

    // Final Attempt: Upsert by email if still not found
    if (!updatedUser && userEmail) {
      console.log("PATCH Profile: Still not found, performing upsert by email");
      updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { 
          name: body.name,
          phone: body.phone,
          gender: body.gender,
          image: body.image,
          email: userEmail // Ensure email is set on create
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    if (!updatedUser) {
      console.log("PATCH Profile: Critical Failure - No way to identify user");
      return NextResponse.json({ message: "Unable to identify user session" }, { status: 400 });
    }

    console.log("PATCH Profile: Success", { updatedName: updatedUser.name });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("PATCH Profile: Error", error);
    return NextResponse.json({ message: error.message || "Error updating profile" }, { status: 500 });
  }
}

// Increase limit for profile photo (base64)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
