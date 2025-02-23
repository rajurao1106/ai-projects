import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const questions = [
  "How would you describe yourself in three words?",
  "What do you think is your greatest strength and weakness?",
  "What motivates you to keep going during tough times?",
  "What is a life experience that shaped who you are today?",
  "If you could change one thing about your past, what would it be?",
  "What’s the most valuable lesson you’ve learned so far?",
  "What’s something you strongly believe in, even if others disagree?",
  "How do you handle criticism or failure?",
  "What does success mean to you?",
  "How do you usually express your emotions?",
  "What qualities do you value the most in a friend or partner?",
  "How do you deal with conflicts in relationships?",
  "Where do you see yourself in five years?",
  "What’s one dream you’ve always wanted to achieve?",
  "What’s your biggest motivation in life?",
];

const PersonalitySurvey = () => {
  const [responses, setResponses] = useState(Array(questions.length).fill(""));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY;

  const handleChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const generateSummary = async () => {
    setLoading(true);
    setSummary(null);

    try {
      const prompt = `Generate a personality summary based on these answers:\n\n${responses.map((ans, i) => `${questions[i]}\nAnswer: ${ans}`).join("\n\n")}`;
      
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      setSummary(data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.");
    } catch (error) {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">Personality Survey</h1>
        <p className="text-gray-600 text-center mb-6">Answer these questions to get a summary of your personality.</p>
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index}>
              <label className="block text-gray-700 font-medium">{question}</label>
              <textarea
                className="w-full mt-2 p-3 border rounded-lg"
                rows="3"
                value={responses[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Your answer..."
              />
            </div>
          ))}
        </div>

        <button
          onClick={generateSummary}
          disabled={loading}
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin h-5 w-5" />} Generate Summary
        </button>

        {summary && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">Your Personality Summary:</h2>
            <p className="text-gray-700 mt-2">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalitySurvey;
