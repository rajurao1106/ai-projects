"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import english_teacher from "../../images/english-teacher.jpg";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

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
        setError("❌ Speech recognition is not supported in this browser.");
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
      const prompt = `You are my friendly AI English teacher. We are having a casual conversation in English after a long time. If I make any grammar mistakes, correct them naturally in a supportive way while keeping the conversation flowing.

      My message: "${text}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!res.ok) throw new Error("❌ Problem receiving response from AI.");
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🤖 Sorry, I couldn't understand that.";
      
      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("⚠️ An error occurred while fetching the response.");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.volume = 1;
    speech.rate = 0.9; // Slightly slower for clarity in teaching context
    speech.pitch = 1;

    speech.onend = () => startListening();
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      {/* Image Section */}
      <div className="hidden lg:flex lg:w-1/2 justify-center items-center relative overflow-hidden">
        <Image
          src={english_teacher}
          alt="AI English Teacher"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/50 to-transparent" />
      </div>

      {/* Chat Section */}
      <div className="w-full relative lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-10 overflow-y-auto">
      <Image
          src={english_teacher}
          alt="AI English Teacher"
          layout="fill"
          objectFit="cover"
          className="hidden max-lg:block"
        />
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center"
        >
          <span className="text-white mr-2">🤖</span>AI English Teacher
        </motion.h1>

        {/* Interaction Area */}
        <div className="flex z-0 flex-col items-center gap-6 w-full max-w-lg">
          <AnimatePresence>
            {!listening && !processing && (
              <motion.button
                onClick={startListening}
                onMouseEnter={() => setIsMicHovered(true)}
                onMouseLeave={() => setIsMicHovered(false)}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3 text-lg font-semibold"
              >
                <span className="text-2xl">🎤</span>
                <span>Speak to Learn</span>
                {isMicHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: -30 }}
                    className="absolute top-0 text-xs text-blue-200"
                  >
                    Practice your English now!
                  </motion.span>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Listening State */}
          {listening && (
            <motion.div
              className="flex items-center gap-3 text-blue-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-3xl">🎙️</span>
              <span className="text-lg font-medium">Listening to you...</span>
            </motion.div>
          )}

          {/* Processing State */}
          {processing && (
            <motion.div
              className="flex items-center gap-3 text-yellow-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-3xl">⏳</span>
              <span className="text-lg font-medium">Preparing a lesson...</span>
            </motion.div>
          )}

          {/* AI Response */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700 w-full"
              >
                <h2 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <span>🤓</span> Your English Teacher:
                </h2>
                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{response}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm font-medium bg-red-900/30 px-4 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Hint */}
        <p className="mt-6 text-gray-400 text-sm text-center">
          Tip: Speak clearly and ask about grammar or vocabulary!
        </p>
      </div>
    </div>
  );
};

export default AIChat;