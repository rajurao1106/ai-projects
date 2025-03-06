"use client";
import React, { useState, useEffect, useCallback } from "react";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const AIChat = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);

  const startListening = useCallback(() => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      setProcessing(true);
      setError(null);
      await fetchAIResponse(userInput);
    };
    recognition.onerror = () => setError("Speech recognition failed.");
    recognition.onend = () => setListening(false);

    recognition.start();
  }, []);

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

      if (!res.ok) throw new Error("Problem receiving response from AI.");
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand.";

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("Error getting response from AI.");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 AI Friends</h1>
      <button
        onClick={startListening}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md"
      >
        🎤 Speak
      </button>
      {processing && (
        <p className="text-yellow-400 mt-4">Processing AI response...</p>
      )}
      {response && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-lg font-semibold">🤖 AI:</h2>
          <p className="mt-2 text-gray-300">{response}</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AIChat;