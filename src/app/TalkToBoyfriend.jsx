import React, { useState } from "react";
import { Search, Loader2, Sparkles, AlertCircle, Heart } from "lucide-react";

const TalkToBoyfriend = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  
  const apiKey = import.meta.env.VITE_API_KEY;

  const customizePrompt = (userInput) => {
    return `एक भारतीय प्रेमी की तरह व्यवहार करो जो मुझसे फ़्लर्ट करता है और जब मैं हिंदी में जवाब देती हूँ तो मज़ाकिया ढंग से मुझसे सवाल करता है: "${userInput}"`;
  };

  const fetchContent = async () => {
    if (!apiKey) {
      setError("API key is missing. Please configure it in your .env file.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a message to start chatting.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const finalPrompt = customizePrompt(prompt);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("No response received. Try again!");
      }

      setResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setError(error.message || "Failed to get a response.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setPrompt(event.target.value);
    setError(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchContent();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-50 to-purple-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 md:p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
            Chat with Your Virtual Boyfriend 💕
          </span>
        </h1>
        <p className="text-gray-600 mb-6">Flirty, Fun, and Engaging Conversations!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={prompt}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full pl-10 pr-4 py-3 outline-hidden rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-300 transition-all bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            <span>{loading ? "Thinking..." : "Send Message"}</span>
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg mt-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transform transition-all duration-500 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-800">Your Boyfriend Replies:</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkToBoyfriend;