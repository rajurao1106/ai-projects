"use client";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuestionAnyTopic = () => {
  const [topic, setTopic] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);

  let speechSynthesisInstance = window.speechSynthesis;

  // Text-to-speech function
  const speakText = (text) => {
    if (speechSynthesisInstance.speaking) speechSynthesisInstance.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speechSynthesisInstance.speak(speech);
  };

  // Fetch definition from API
  const fetchDefinition = useCallback(async () => {
    if (!topic.trim()) {
      setError("⚠️ Please enter a topic.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Define ${topic}.` }] }] }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch definition.");

      const data = await res.json();
      const aiDefinition = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Definition not found.";
      
      setDefinition(aiDefinition);
      speakText(aiDefinition);
    } catch (error) {
      setError(`⚠️ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  // Fetch AI-generated question
  const fetchAIQuestion = useCallback(async () => {
    if (!definition) {
      setError("⚠️ Get the definition first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setChatHistory([]);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Ask me a basic question about ${definition}.` }] }] }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch question.");

      const data = await res.json();
      const aiQuestion = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No question available.";
      
      setChatHistory([{ role: "assistant", text: aiQuestion }]);
      speakText(aiQuestion);
    } catch (error) {
      setError(`⚠️ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [definition]);

  // Validate user answer using AI
  const checkAnswer = async (userAnswer) => {
    if (!chatHistory.length) return;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Evaluate the following: Definition - ${definition}, User's Answer - ${userAnswer}. If the answer is correct or closely related, respond with 'It is correct.' If it is incorrect, say 'It is not correct' and provide the correct answer.` }] }] }),
        }
      );

      if (!res.ok) throw new Error("Failed to validate answer.");

      const data = await res.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Could not validate answer.";
      
      setChatHistory((prev) => [...prev, { role: "user", text: userAnswer }, { role: "assistant", text: aiResponse }]);
      speakText(aiResponse);
    } catch (error) {
      setError(`⚠️ ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 text-white bg-gray-900">
      <motion.h1 className="text-3xl font-bold mb-6">Ask AI Any Topic</motion.h1>

      <Card className="p-6 w-full max-w-lg bg-gray-800">
        <input 
          type="text" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          placeholder="Enter a topic..." 
          className="w-full p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
        />
        
        <Button 
          onClick={fetchDefinition} 
          disabled={isLoading} 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500"
        >
          {isLoading ? "Loading..." : "Get Definition"}
        </Button>

        {definition && (
          <motion.p className="mt-4 p-3 bg-gray-700 rounded">
            {definition}
          </motion.p>
        )}

        <Button 
          onClick={fetchAIQuestion} 
          disabled={isLoading || !definition}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
        >
          {isLoading ? "Loading..." : "Ask Questions"}
        </Button>

        {chatHistory.length > 0 && (
          <div className="mt-6 space-y-2">
            {chatHistory.map((msg, index) => (
              <motion.p 
                key={index} 
                className={`p-3 rounded ${msg.role === "user" ? "bg-gray-600" : "bg-blue-600"}`}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
              >
                {msg.text}
              </motion.p>
            ))}
          </div>
        )}

        <input 
          type="text"  
          placeholder="Write your answer..." 
          className="mt-4 w-full p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkAnswer(answer)}
        />
      </Card>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default QuestionAnyTopic;
