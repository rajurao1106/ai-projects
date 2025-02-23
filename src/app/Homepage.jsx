"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageCircleHeart } from "lucide-react";
import { IoMdFemale } from "react-icons/io";
import { IoMdMale } from "react-icons/io";


export default function Homepage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Fun & Meaningful Experiences
          </span>
        </h1>

        <div className="space-y-4">
          <Link
            href="/MeaningYourName"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            Explore the Deeper Meaning of Your Name
          </Link>

          <Link
            href="/TalkToBoyfriend"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            Make A Friends
          </Link>

          {open ? (
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="flex cursor-pointer items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
            >
              <MessageCircleHeart className="h-5 w-5" />
              Talk To Friend
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/TalkToGirlfriend"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
              >
                <IoMdMale className="h-5 w-5" />
                Male
              </Link>
              <Link
                href="/Talk-To-Boyfriend"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
              >
                <IoMdFemale className="h-5 w-5" />
                Female
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
