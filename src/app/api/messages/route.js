import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Message from "@/models/Message";

const MONGO_URI = "mongodb+srv://rajurao1107:raoraju1337@cluster0.zjucb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGO_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function GET() {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    const newMessage = new Message({ text: message.text, user: message.user, timestamp: Date.now() });
    await newMessage.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
