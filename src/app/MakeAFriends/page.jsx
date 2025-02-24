"use client";
import React, { useState, useEffect, useCallback } from "react";

const Chatbot = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("hi-IN");
  const [jokeMode, setJokeMode] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const startListening = useCallback(() => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setListening(true);
    };

    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      console.log("🗣️ User said:", userInput);
      setProcessing(true);
      setError(null);
      await fetchAIResponse(userInput);
    };

    recognition.onerror = (event) => {
      console.error("🚨 Speech recognition error:", event.error);
      setError("वाणी पहचान विफल। कृपया पुनः प्रयास करें।");
    };

    recognition.onend = () => {
      console.log("⏹️ Speech recognition stopped");
      setListening(false);
    };

    recognition.start();
  }, [language]);

  useEffect(() => {
    if (listening) {
      startListening();
    }
  }, [listening, startListening]);

  const fetchAIResponse = async (text) => {
    try {
      const prompt = jokeMode
        ? `तुम एक शायर की तरह बोलो और यूजर द्वारा पूछे गए सवाल का उत्तर हिंदी शायरी में दो।\n\nयूजर ने कहा: "${text}"`
        : `यूजर ने हिंदी में कुछ कहा: "${text}" कृपया इसका उत्तर हिंदी में दें।`;

      console.log("📩 API Prompt:", prompt);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!res.ok) {
        throw new Error("AI प्रतिक्रिया प्राप्त करने में विफल।");
      }

      const data = await res.json();
      console.log("🤖 API Response:", data);

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "माफ़ कीजिए, मैं समझ नहीं पाया।";

      console.log("🎭 AI Output:", aiText);

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      console.error("🚨 AI Fetch Error:", error);
      setError("AI प्रतिक्रिया लाने में समस्या। कृपया API कुंजी जांचें।");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    console.log("🔊 Speaking:", text);
    window.speechSynthesis.cancel(); // Stops any previous speech
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.rate = jokeMode ? 1.2 : 1;
    speech.pitch = jokeMode ? 1.5 : 1;
    speech.onend = () => setListening(true);
    window.speechSynthesis.speak(speech);
  };

  return (
    <>
      <title>हिंदी वॉयस AI चैटबॉट - बोलकर उत्तर पाएं</title>
      <meta
        name="description"
        content="अपने सवालों के जवाब हिंदी में सुनें! AI वॉयस चैटबॉट से तुरंत उत्तर प्राप्त करें।"
      />
      <meta name="keywords" content="AI चैटबॉट, हिंदी वॉयस असिस्टेंट, AI उत्तर, GPT चैट, शायरी मोड" />
      <meta property="og:title" content="हिंदी वॉयस AI चैटबॉट - बोलकर उत्तर पाएं" />
      <meta
        property="og:description"
        content="अपने सवालों के जवाब हिंदी में सुनें! AI वॉयस चैटबॉट से तुरंत उत्तर प्राप्त करें।"
      />
      <meta property="og:image" content="/chatbot-thumbnail.png" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="हिंदी वॉयस AI चैटबॉट" />
      <meta name="twitter:image" content="/chatbot-thumbnail.png" />

      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">🎙 वॉयस AI चैटबॉट</h1>

        <div className="flex gap-4 mb-4">
          <select onChange={(e) => setLanguage(e.target.value)} value={language} className="p-2 bg-gray-800 text-white rounded">
            <option value="hi-IN">हिंदी</option>
            <option value="en-US">अंग्रेज़ी</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={jokeMode} onChange={() => setJokeMode(!jokeMode)} className="hidden" />
            <span className={`p-2 rounded ${jokeMode ? 'bg-green-600' : 'bg-gray-700'}`}>शायराना मोड 🎭</span>
          </label>
        </div>

        {!listening && !processing && (
          <button onClick={() => setListening(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md">
            🎤 बात करना शुरू करें
          </button>
        )}

        {processing && <p className="text-yellow-400 mt-4">AI प्रतिक्रिया प्रोसेस हो रही है...</p>}

        {response && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-lg font-semibold">🤖 AI उत्तर:</h2>
            <p className="mt-2 text-gray-300">{response}</p>
            <pre className="mt-4 text-sm text-gray-400 bg-gray-700 p-2 rounded">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </>
  );
};

export default Chatbot;
