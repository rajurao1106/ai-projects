"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const QuestionAnyTopic = () => {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAIResponse = async (history) => {
    if (!topic.trim()) {
      setError("⚠️ Please enter a topic before asking.");
      return;
    }
    setError(null);
    setIsLoading(true);

    if (!process.env.NEXT_PUBLIC_API_KEY) {
      setError("⚠️ API key is missing. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    const formattedHistory = [
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Ask me a question related to \"${topic}\". 
            - If my answer is correct, then say \"it is correct\". 
            - If my answer is incorrect, explain why it is wrong and ask the same question again in a simpler way.`,
          },
        ],
      },
    ];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contents: formattedHistory }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ AI could not generate a response.";

      setChatHistory([...history, { role: "assistant", text: aiText }]);
    } catch (error) {
      console.error("AI API Error:", error);
      setError(`⚠️ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserResponse = (e) => {
    if (e.key === "Enter" && response.trim()) {
      const updatedChat = [...chatHistory, { role: "user", text: response.trim() }];
      setChatHistory(updatedChat);
      setResponse("");
      fetchAIResponse(updatedChat);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col items-center justify-center p-8">
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
        onClick={() => fetchAIResponse(chatHistory)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg text-lg font-medium mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Ask"}
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

      <input
        type="text"
        placeholder="Your answer..."
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        onKeyDown={handleUserResponse}
        className="w-full max-w-md p-3 text-lg text-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 mt-4"
      />
    </div>
  );
};

export default QuestionAnyTopic;