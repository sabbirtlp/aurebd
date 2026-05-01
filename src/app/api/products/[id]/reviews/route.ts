import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const { rating, comment, name } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json({ message: 'Rating and comment are required' }, { status: 400 });
    }

    // Try to find product by slug or by ID
    let product;
    if (params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(params.id);
    } else {
      product = await Product.findOne({ slug: params.id });
    }

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const review = {
      user: session?.user?.name || name || 'Anonymous',
      rating: Number(rating),
      comment,
    };

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    // Revalidate Next.js cache so the new review shows up immediately
    try {
      const { revalidatePath, revalidateTag } = require('next/cache');
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/product/${product._id}`);
      revalidatePath('/'); 
      revalidateTag('product-by-slug');
      revalidateTag('all-products');
    } catch (e) {
      console.error('Cache revalidation error:', e);
    }

    return NextResponse.json({ message: 'Review added', product }, { status: 201 });
  } catch (error: any) {
    console.error('Add review error details:', error.stack || error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}
