import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      user: userId,
    } = body;

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { message: 'No order items' },
        { status: 400 }
      );
    }

    const order = new Order({
      orderItems,
      user: userId,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Error creating order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const orders = await Order.find({}); // Fetch all orders for now
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}
