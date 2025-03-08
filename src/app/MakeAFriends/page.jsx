"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import english_teacher from "../../images/english-teacher.jpg";

const AIChat = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isMicHovered, setIsMicHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = "en-US";
        recog.continuous = false;
        recog.interimResults = false;
        setRecognition(recog);
      } else {
        setError(
          "❌ Your browser doesn't support speech recognition. Please try a modern browser."
        );
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    setError(null);
    recognition.onstart = () => setListening(true);
    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      setProcessing(true);
      await fetchAIResponse(userInput);
    };
    recognition.onerror = (e) => {
      setError(`⚠️ Speech recognition error: ${e.error}`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [recognition]);

  const fetchAIResponse = async (text) => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are my long-lost friend from Delhi, India. You are unmarried and working in a web development job. We’re finally reconnecting after a long time! Respond warmly and casually, like an old friend catching up.

I will ask you five questions, and you will reply to each one. After I have asked all five questions, you will say 'Well done!'

Notice: When you meet the user, keep the conversation short—only one line. Speak only in English.
 ${text}`,
                  },
                ], 
              },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error("❌ Trouble connecting to the AI.");
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🤖 Hmm, I didn’t catch that. Could you try again?";

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("⚠️ Something went wrong. Let’s try that again!");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.volume = 1;
    speech.rate = 0.85;
    speech.pitch = 1.1;
    speech.onend = () => startListening();
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Section with Image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src={english_teacher}
          alt="Your AI English Teacher"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 to-transparent" />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col items-center justify-between p-8 lg:p-12 relative">
        {/* Mobile Background Overlay */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src={english_teacher}
            alt="Your AI English Teacher"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gray-900/60" />
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-4xl text-center font-extrabold mb-8 z-10 bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Your AI English Teacher
        </motion.h1>

        {/* Task List */}
        <div className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">
            Complete Your Task:
          </h2>
          <ul className="text-sm space-y-1">
            <li>✅ How are you?</li>
            <li>✅ Where have you been all this time?</li>
            <li>✅ What are you doing these days?</li>
            <li>✅ Would you like to share any new experiences?</li>
            <li>✅ What are your plans for the coming days?</li>
          </ul>
        </div>

        {/* Microphone Button */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
          <AnimatePresence mode="wait">
            {!listening && !processing && (
              <motion.button
                key="mic-button"
                onClick={startListening}
                onMouseEnter={() => setIsMicHovered(true)}
                onMouseLeave={() => setIsMicHovered(false)}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 0 20px rgba(79, 70, 229, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-full shadow-lg transition-all duration-300 flex items-center gap-4 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500"
                aria-label="Start speaking to your English teacher"
              >
                <span className="text-2xl animate-pulse">🎤</span>
                <span>Start Speaking</span>
                {isMicHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -40 }}
                    className="absolute top-0 text-sm text-indigo-300 font-light"
                  >
                    Let’s practice English together!
                  </motion.span>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
