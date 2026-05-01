import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({ 
    authenticated: !!session,
    user: session?.user || null,
    role: (session?.user as any)?.role || "none"
  });
}
