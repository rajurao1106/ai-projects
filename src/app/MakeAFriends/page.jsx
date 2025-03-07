"use client"
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
          "❌ Your browser does not support speech recognition. Please use a modern browser."
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
    recognition.onerror = () => {
      setError("⚠️ Speech recognition failed. Please try again.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [recognition]);

  const fetchAIResponse = async (text) => {
    try {
      const res = await fetch("https://api.xai.com/grok3", {
        // Hypothetical endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          message: text,
          role: "I am your professional AI English teacher, here to assist you in a friendly and conversational manner. Let’s practice English together! I’ll listen to you, respond naturally, and gently correct any grammar mistakes within our chat, keeping the conversation smooth and engaging.",
        }),
      });

      if (!res.ok) throw new Error("❌ Unable to connect to the AI service.");
      const data = await res.json();
      const aiText =
        data.response || "🤖 I didn’t quite understand that. Could you try again?";

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("⚠️ An error occurred. Please try again!");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.volume = 1;
    speech.rate = 0.85; // Slower pace for clear pronunciation
    speech.pitch = 1.1; // Slightly higher pitch for a warm, approachable tone
    speech.onend = () => startListening();
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Image Section */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src={english_teacher}
          alt="Your AI English Teacher"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/70 to-transparent" />
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col items-center justify-between p-8 lg:p-12 relative">
        {/* Mobile Image Overlay */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src={english_teacher}
            alt="Your AI English Teacher"
            layout="fill"
            objectFit="cover"
            className=""
          />
          <div className="absolute inset-0 bg-gray-900/60" />
        </div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-extrabold mb-8 z-10 bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Your AI English Teacher
        </motion.h1>

        {/* Interaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
          <AnimatePresence mode="wait">
            {/* Idle State */}
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
                aria-label="Begin your English lesson"
              >
                <span className="text-2xl animate-pulse">🎤</span>
                <span>Start Speaking</span>
                {isMicHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -40 }}
                    className="absolute top-0 text-sm text-indigo-300 font-light"
                  >
                    Ready to improve your English?
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* Listening State */}
            {listening && (
              <motion.div
                key="listening"
                className="flex items-center gap-4 text-indigo-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-3xl">🎙️</span>
                <span className="text-xl font-medium">I’m listening...</span>
              </motion.div>
            )}

            {/* Processing State */}
            {processing && (
              <motion.div
                key="processing"
                className="flex items-center gap-4 text-teal-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-3xl">✨</span>
                <span className="text-xl font-medium">
                  Crafting your response...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Response */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-8 bg-gray-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-indigo-500/20 w-full"
              >
                <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center gap-3">
                  <span>📚</span> Your Teacher Responds:
                </h2>
                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap text-base">
                  {response}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 text-red-300 text-sm font-medium bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-sm text-gray-400 z-10 text-center max-w-xs"
        >
          Tip: Feel free to ask about grammar, vocabulary, or simply chat in English!
        </motion.p>
      </div>
    </div>
  );
};

export default AIChat;