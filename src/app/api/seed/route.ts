import { NextResponse } from 'next/server';
import { seedDatabase } from '@/services/product.service';

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully!", 
      result 
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to seed database", 
      error: error.message 
    }, { status: 500 });
  }
}
