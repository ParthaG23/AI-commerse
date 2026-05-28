import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    user.password = undefined;
    return NextResponse.json({ message: 'Logged in successfully', user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
