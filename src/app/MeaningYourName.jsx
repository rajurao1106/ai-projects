import React, { useState } from "react";
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react";

const MeaningYourName = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  
  // Make sure you have the correct .env variable for the API key
  const apiKey = import.meta.env.VITE_API_KEY; // Using Vite here, change for Create React App if needed

  const customizePrompt = (userInput) => {
    return `when I put any name, give the meaning of that name: "${userInput}"`;
  };

  const fetchContent = async () => {
    if (!apiKey) {
      setError("API key is missing. Please configure it in your .env file.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a name to get its meaning.");
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
        throw new Error("No meaningful response received. Try another name.");
      }

      setResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setError(error.message || "Failed to fetch name meaning.");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12 flex flex-col justify-center items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Explore the Deeper Meaning of Your Name
            </span>
          </h1>
          <p className="text-gray-600 justify-center items-center text-md flex-wrap flex w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
            What Is The Meaning Of Your Name <span className="text-pink-500 mx-1">{prompt}</span> ?
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={prompt}
                onChange={handleInputChange}
                placeholder="Enter a name..."
                className="w-full outline-none pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/90 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5" />}
              <span>{loading ? "Discovering meaning..." : "Reveal Meaning"}</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 transform transition-all duration-500 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Name Meaning</h2>
            </div>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {response || "No meaning found, try another name!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeaningYourName;
