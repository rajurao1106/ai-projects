"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence for exit animations
import Image from "next/image";
import english_teacher from '../../images/english-teacher.jpg'

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const AIChat = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  // UI State for improved UX
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
      const prompt = `You are my old friend, and we are talking after a long time. We will have a friendly conversation in English. If I make any grammar mistakes, correct them naturally in a friendly way while continuing the conversation. 

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
        "🤖 Sorry, I couldn't understand.";

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("⚠️ An error occurred while fetching the AI response.");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.volume = 1; // Ensure volume is audible
    speech.rate = 1; // Normal speaking rate
    speech.pitch = 1; // Normal pitch

    speech.onend = () => startListening();
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Header with subtle gradient */}
      <Image src={english_teacher} className="absolute w-full -top-[70%] max-lg:top-0 h-screeen z-0"/>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold z-0 mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
      >
        <span className="text-white">🤖</span>AI English Teacher
      </motion.h1>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Mic Button with Tooltip-like Effect */}
        <AnimatePresence>
          {!listening && !processing && (
            <motion.button
              onClick={startListening}
              onMouseEnter={() => setIsMicHovered(true)}
              onMouseLeave={() => setIsMicHovered(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 text-lg font-medium"
            >
              <span>🎤 Speak</span>
            
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
            <span className="text-2xl">🎙️</span>
            <span className="text-lg font-medium">Listening to you...</span>
          </motion.div>
        )}

        {/* Processing State */}
        {processing && (
          <motion.div
            className="flex items-center gap-3 text-yellow-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-2xl">⏳</span>
            <span className="text-lg font-medium">Thinking...</span>
          </motion.div>
        )}

        {/* AI Response */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 w-full"
            >
              <h2 className="text-lg font-semibold text-blue-300 mb-2 flex items-center gap-2">
                <span>🤖</span> Your AI Friend:
              </h2>
              <p className="text-gray-200 leading-relaxed">{response}</p>
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
              className="text-red-400 text-sm font-medium bg-red-900/20 px-4 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Hint */}
      <p className="mt-8 text-gray-500 text-sm">
        Tip: Speak clearly for the best experience!
      </p>
    </div>
  );
};

export default AIChat;