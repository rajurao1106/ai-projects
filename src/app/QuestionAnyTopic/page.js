"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ai_teacher from '@/images/ai-teacher.jpg'

const QuestionAnyTopic = () => {
  const [topic, setTopic] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setError("⚠️ Your browser does not support speech recognition.");
      return;
    }

    setIsListening(true);
    setError(null);

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const userAnswer = event.results[0][0].transcript;
      setIsListening(false);
      setChatHistory((prev) => [...prev, { role: "user", text: userAnswer }]);
      checkAnswer(userAnswer);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(`⚠️ Speech recognition error: ${event.error}`);
    };

    recognition.start();
  };

  const fetchAIQuestion = async () => {
    if (!topic.trim()) {
      setError("⚠️ Please enter a topic before asking.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setChatHistory([]); // Clear previous chat

    if (!process.env.NEXT_PUBLIC_API_KEY) {
      setError("⚠️ API key is missing. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    const formattedHistory = [
      {
        role: "user",
        parts: [{ text: `Ask me a basic question related to "${topic}".` }],
      },
    ];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: formattedHistory }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const aiQuestion =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ AI could not generate a question.";

      setChatHistory([{ role: "assistant", text: aiQuestion }]);
      speakText(aiQuestion); // AI asks the question via audio
    } catch (error) {
      console.error("AI API Error:", error);
      setError(`⚠️ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = async (userAnswer) => {
    const lastQuestion = chatHistory[chatHistory.length - 1]?.text;
    if (!lastQuestion) return;

    const formattedHistory = [
      { role: "assistant", parts: [{ text: lastQuestion }] },
      { role: "user", parts: [{ text: userAnswer }] },
      {
        role: "user",
        parts: [
          {
            text: `Is my answer "${userAnswer}" correct? If yes, say "✅ Correct!". If incorrect, explain why and ask again in simpler terms.`,
          },
        ],
      },
    ];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: formattedHistory }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const aiResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ AI could not generate a response.";

      setChatHistory((prev) => [...prev, { role: "assistant", text: aiResponse }]);
      speakText(aiResponse); // AI responds with audio
    } catch (error) {
      console.error("AI API Error:", error);
      setError(`⚠️ ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col items-center justify-center p-8">
      <Image
                src={ai_teacher}
                alt="Your AI Hindi Shayar"
                layout="fill"
          objectFit="cover"
                className="absolute opacity-20"
              />
      <div className="z-0 flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400 bg-clip-text text-transparent"
      >
        AI Topic-Based Questioning
      </motion.h1>

      <input
        type="text"
        placeholder="Enter a topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full max-w-md p-3 text-lg text-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 mb-4"
      />

      <motion.button
        onClick={fetchAIQuestion}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg text-lg font-medium mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Ask Quetions"}
      </motion.button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="w-full max-w-md">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-3 m-2 rounded-lg ${
              msg.role === "user" ? "bg-gray-700 text-white" : "bg-indigo-600 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {chatHistory.length > 0 && (
        <motion.button
          onClick={startListening}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`mt-4 px-6 py-3 rounded-full shadow-lg text-lg font-medium ${
            isListening ? "bg-red-600" : "bg-green-600"
          } text-white`}
        >
          {isListening ? "Listening... 🎤" : "Answer with Voice 🎙️"}
        </motion.button>
      )}
      </div>
    </div>
  );
};

export default QuestionAnyTopic;
