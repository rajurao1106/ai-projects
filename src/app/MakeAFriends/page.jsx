"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import english_teacher from "../../images/english-teacher.jpg";

const questions = [
  "How are you?",
  "Where have you been all this time?",
  "What are you doing these days?",
  "Would you like to share any new experiences?",
  "What are your plans for the coming days?",
];

const AIChat = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  
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
        setError("❌ Your browser doesn't support speech recognition.");
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
      const updatedChat = [...chatHistory, { role: "user", text: userInput }];
      setChatHistory(updatedChat);
      checkCompletion(userInput);
      await fetchAIResponse(updatedChat);
    };
    recognition.onerror = (e) => {
      setError(`⚠️ Speech recognition error: ${e.error}`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [recognition, chatHistory]);

  const checkCompletion = (userInput) => {
    const matchedQuestion = questions.find((q) =>
      userInput.toLowerCase().includes(q.toLowerCase())
    );
    if (matchedQuestion && !answeredQuestions.includes(matchedQuestion)) {
      setAnsweredQuestions([...answeredQuestions, matchedQuestion]);
    }
  };

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
              parts: [{ text: msg.text }],
            })),
          }),
        }
      );

      if (!res.ok) throw new Error("❌ Trouble connecting to AI.");
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🤖 Hmm, I didn’t catch that. Could you try again?";

      setResponse(aiText);
      setChatHistory([...history, { role: "assistant", text: aiText }]);
      speak(aiText);
    } catch (error) {
      setError("⚠️ Something went wrong.");
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
    speech.onend = () => {
      if (answeredQuestions.length === questions.length) {
        speak("Well done! You completed all five questions in English.");
      } else {
        setTimeout(() => startListening(), 1000);
      }
    };
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-900 text-gray-100 flex flex-col lg:flex-row overflow-hidden">
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

      <div className="w-full lg:w-1/2 h-screen flex flex-col items-center justify-between p-8 lg:p-12 relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl text-center font-extrabold mb-8 bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Your AI English Teacher
        </motion.h1>

        <div className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">
            Complete Your Task:
          </h2>
          <ul className="text-sm space-y-1">
            {questions.map((q, i) => (
              <li key={i} className={answeredQuestions.includes(q) ? "text-green-400" : ""}>
                {answeredQuestions.includes(q) ? "✅ " : "❌ "}{q}
              </li>
            ))}
          </ul>
          {answeredQuestions.length === questions.length && (
            <p className="text-green-400 mt-4">🎉 Well done! You completed all five questions in English.</p>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
          <AnimatePresence mode="wait">
            {!listening && !processing && (
              <motion.button
                key="mic-button"
                onClick={startListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-full shadow-lg transition-all duration-300 text-lg font-medium"
              >
                🎤 Start Speaking
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIChat;