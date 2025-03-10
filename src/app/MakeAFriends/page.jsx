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
  const [chatHistory, setChatHistory] = useState([]); // ✅ Stores full conversation history
  const [isMicHovered, setIsMicHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = "hi-IN"; // ✅ Hindi language recognition
        recog.continuous = false;
        recog.interimResults = false;
        setRecognition(recog);
      } else {
        setError("❌ Your browser doesn't support speech recognition.");
      }
    }
  }, []);

  // 🎤 Start listening to user input
  const startListening = useCallback(() => {
    if (!recognition) {
      setError("⚠️ Speech recognition is not initialized.");
      return;
    }
    setError(null);
    recognition.onstart = () => setListening(true);

    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      setProcessing(true);
      const updatedChat = [...chatHistory, { role: "user", text: userInput }];
      setChatHistory(updatedChat);
      await fetchAIResponse(updatedChat);
    };

    recognition.onerror = (e) => {
      setError(`⚠️ Speech recognition error: ${e.error}`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }, [recognition, chatHistory]);

  // 🤖 Fetch AI response with full conversation history (Shayar Mode)
  const fetchAIResponse = async (history) => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: history.map((msg) => ({
              role: msg.role,
              parts: [
                {
                  text:
                    msg.role === "user"
                      ? `Act as a friendly AI named Rohit who gives short, engaging, and conversational replies in Hindi. Rohit maintains a warm and cheerful tone, responding in a casual and friendly manner while remembering past conversations: "${msg.text}"`
                      : msg.text,
                },
                // Act as a friendly AI named Rohit who gives short replies in Hindi
                // Act as a friendly AI named Rohit who gives short, engaging, and conversational replies in Hindi. Rohit maintains a warm and cheerful tone, responding in a casual and friendly manner while remembering past conversations.
              ],
            })),
          }),
        }
      );

      if (!res.ok) throw new Error("❌ Trouble connecting to AI.");
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🤖 मुझे समझ नहीं आया, कृपया फिर से कोशिश करें।";

      setResponse(aiText);
      setChatHistory([...history, { role: "assistant", text: aiText }]); // ✅ AI Response added to history
      speak(aiText);
    } catch (error) {
      console.error("AI API Error:", error);
      setError(`⚠️ ${error.message || "कुछ गलत हो गया।"}`);
    } finally {
      setProcessing(false);
    }
  };

  // 🔊 AI Speaks Response (Hindi)
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN"; // ✅ Corrected for Hindi speech synthesis
    speech.volume = 1;
    speech.rate = 0.85;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col lg:flex-row overflow-hidden">
      {/* 📷 Left side image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src={english_teacher}
          alt="Your AI Hindi Shayar"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 to-transparent" />
      </div>

      {/* 🗣 Chat UI */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col items-center justify-between p-8 lg:p-12 relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-4xl text-center font-extrabold mb-8 z-10 bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Your AI English Teacher
        </motion.h1>

        {/* 📝 Suggested Prompts */}
        <div className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">
            पूछिए कुछ मज़ेदार:
          </h2>
          <ul className="text-sm space-y-1">
            <li>✅ Hey! What’s your plan for the weekend?</li>
            <li>✅ What time are you planning to go?</li>
            <li>✅ Have you watched the new superhero movie?</li>
            <li>✅ Should I watch it?</li>
            <li>✅ How’s your exam preparation going?</li>
            <li>✅ Want to study together tomorrow?</li>
            <li>✅ Let’s plan a trip during the holidays!</li>
            <li>✅ Where do you want to go?</li>
            <li>✅ Can you tell me a joke?</li>
            <li>✅ How do I improve my English pronunciation?</li>
            <li>✅ Tell me a fun fact!</li>
          </ul>
        </div>

        {/* 🎤 Mic Button */}
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
                className="relative bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-full shadow-lg transition-all duration-300 flex items-center gap-4 text-lg font-medium"
                aria-label="Start speaking to your AI Shayar"
              >
                <span className="text-2xl animate-pulse">🎤</span>
                <span>शायरी सुनें</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
