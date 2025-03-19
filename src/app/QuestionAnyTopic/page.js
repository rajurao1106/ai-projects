  "use client";
  import React, { useState, useCallback, useEffect, useRef } from "react";
  import { motion } from "framer-motion";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import Image from "next/image";
  import ai_teacher from "../../images/ai-teacher.jpg";

  const QuestionAnyTopic = () => {
    const [topic, setTopic] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [definition, setDefinition] = useState("");
    const [showDefinition, setShowDefinition] = useState(true); // New state variable
    const [answer, setAnswer] = useState("");

    const chatContainerRef = useRef(null);

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chatHistory]);

    // Text-to-speech function
    const speakText = (text) => {
      if (typeof window !== "undefined") {
        const synth = window.speechSynthesis;
        if (synth.speaking) synth.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        synth.speak(speech);
      }
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
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `Provide a detailed definition of '${topic}', covering all key aspects, subtopics, and related concepts for a comprehensive understanding.` }] }],
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to fetch definition.");

        const data = await res.json();
        const aiDefinition =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "Definition not found.";

        setDefinition(aiDefinition);
        setShowDefinition(true); // Show definition when it is fetched
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
    
      setShowDefinition(false); // Hide definition when asking a question
    
      try {
        // Store all previous AI-generated questions to avoid repetition
        const pastQuestions = chatHistory
          .filter((msg) => msg.role === "assistant")
          .map((msg) => msg.text)
          .join("\n");
    
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Create a basic, short and common interview question based on '${definition}' that has not been asked before.

Here is the full history of previous questions:
${pastQuestions}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
    
        if (!res.ok) throw new Error("Failed to fetch question.");
    
        const data = await res.json();
        const aiQuestion =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No question available.";
    
        setChatHistory((prev) => [...prev, { role: "assistant", text: aiQuestion }]);
        speakText(aiQuestion);
      } catch (error) {
        setError(`⚠️ ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }, [definition, chatHistory]);
    


    // Validate user answer using AI
    const checkAnswer = async () => {
      if (!chatHistory.length || !answer.trim()) return;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Evaluate the following: Definition - ${definition}, User's Answer - ${answer}. If the answer is correct or closely related, respond with 'It is correct.' If it is incorrect, say 'It is not correct' and provide the correct answer.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to validate answer.");

        const data = await res.json();
        const aiResponse =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "Could not validate answer.";

        setChatHistory((prev) => [
          ...prev,
          { role: "user", text: answer },
          { role: "assistant", text: aiResponse },
        ]);
        speakText(aiResponse);

        // If the answer is incorrect, show the definition again.
        if (aiResponse.includes("It is not correct")) {
          setShowDefinition(true);
        }
      } catch (error) {
        setError(`⚠️ ${error.message}`);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center p-8 text-white bg-blue-950 relative">
        <Image
          src={ai_teacher}
          alt="AI Teacher"
          layout="fill"
          objectFit="cover"
          className="absolute z-0 top-0 w-full h-full opacity-30"
        />

        <motion.h1 className="text-3xl font-bold mb-6 z-10">
          Ask AI Any Topic
        </motion.h1>

        <Card className="p-6 w-full max-w-lg bg-[#5050501f] z-10">
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
            <motion.p className={`mt-4 p-3 overflow-auto h-[15rem] ${showDefinition?"text-white":"text-gray-700"} bg-gray-700 rounded`}>
              {definition}
            </motion.p>
          )}

          {chatHistory.length > 0 && (
            <div
              ref={chatContainerRef}
              className="mt-6 space-y-2 overflow-y-auto h-[10rem] p-2 border border-gray-300 rounded-lg"
            >
              {chatHistory.map((msg, index) => (
                <motion.p
                  key={index}
                  className={`p-3 rounded text-white ${
                    msg.role === "user" ? "bg-gray-600" : "bg-blue-600"
                  }`}
                >
                  {msg.text}
                </motion.p>
              ))}
            </div>
          )}

          <Button
            onClick={fetchAIQuestion}
            disabled={isLoading || !definition}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
          >
            {isLoading ? "Loading..." : "Ask Questions"}
          </Button>

          <input
            type="text"
            placeholder="Write your answer..."
            className="mt-4 w-full p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={checkAnswer}
          >
            Check Answer
          </button>
        </Card>

        {error && <p className="text-red-500 mt-4 z-10">{error}</p>}
      </div>
    );
  };

  export default QuestionAnyTopic;
