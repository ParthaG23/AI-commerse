import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id: productId } = await params;
    const body = await req.json();
    const { name, rating, comment } = body;

    if (!name || !rating || !comment) {
      return NextResponse.json(
        { message: 'Name, rating, and comment are required fields' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Create the new review object
    const newReview = {
      name,
      rating: Number(rating),
      comment,
    };

    // Push into reviews list
    product.reviews.push(newReview);

    // Dynamic ratings recalculation
    const totalRating = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    product.ratings = Number((totalRating / product.reviews.length).toFixed(1));

    // Save modifications to MongoDB Atlas
    await product.save();

    return NextResponse.json({
      message: 'Review submitted successfully',
      ratings: product.ratings,
      reviewsCount: product.reviews.length,
      product,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error posting customer review:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
