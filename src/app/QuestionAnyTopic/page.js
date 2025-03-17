"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QuestionAnyTopic = () => {
  const [topic, setTopic] = useState("");
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = "hi-US";
        recog.continuous = false;
        recog.interimResults = false;
        setRecognition(recog);
      } else {
        setError("❌ Your browser doesn't support speech recognition.");
      }
    }
  }, []);

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
                      ? `Ask a question related to the topic: "${topic}" based on the user's response: "${msg.text}"`
                      : msg.text,
                },
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
      setChatHistory([...history, { role: "assistant", text: aiText }]);
      speak(aiText);
    } catch (error) {
      console.error("AI API Error:", error);
      setError(`⚠️ ${error.message || "कुछ गलत हो गया।"}`);
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.volume = 1;
    speech.rate = 0.85;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
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
        className="w-full max-w-md p-3 text-lg text-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 mb-6"
      />

      <motion.button
        onClick={startListening}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg text-lg font-medium"
      >
        Start Talking
      </motion.button>
    </div>
  );
};

export default QuestionAnyTopic;