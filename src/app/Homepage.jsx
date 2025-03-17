"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageCircleHeart } from "lucide-react";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

export default function Homepage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Fun & Meaningful Experiences
          </span>
        </h1>

        <div className="space-y-4">
          {[
            { href: "/QuestionAnyTopic", text: "Question Any Topic For Answer" },
            { href: "/MeaningYourName", text: "Deeper Meaning of Your Name" },
            { href: "/MakeAFriends", text: "AI English Teacher" },
          ].map(({ href, text }, index) => (
            <Link
              key={index}
              href={href}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
              {text}
            </Link>
          ))}

          {/* Talk To Friend Toggle Button */}
          <div
            onClick={() => setOpen((prev) => !prev)}
            className="cursor-pointer flex items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
          >
            <MessageCircleHeart className="h-5 w-5 transition-transform" />
            Talk To Friend
          </div>

          {/* Animated Friend Options */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 mt-3"
              >
                <Link
                  href="/TalkToGirlfriend"
                  className="group flex items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
                >
                  <IoMdMale className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Male
                </Link>
                <Link
                  href="/Talk-To-Boyfriend"
                  className="group flex items-center justify-center gap-3 bg-white border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-xl font-medium shadow-md transition-all duration-200 transform hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-xl"
                >
                  <IoMdFemale className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Female
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
