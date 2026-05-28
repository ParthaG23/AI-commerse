import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { _id, name, email, preferences } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { name, email, preferences },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating profile' },
      { status: 500 }
    );
  }
}
