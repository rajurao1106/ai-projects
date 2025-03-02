import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";

// GET API - Fetch all messages
export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ timestamp: -1 }); // Sort by latest
    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST API - Save new message
export async function POST(req) {
  try {
    const { user, text } = await req.json();
    await connectDB();
    const newMessage = new Message({ user, text });
    await newMessage.save();
    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
  }
}
