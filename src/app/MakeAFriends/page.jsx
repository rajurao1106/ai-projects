"use client";
import React, { useState, useEffect, useCallback } from "react";

const Chatbot = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("hi-IN");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const startListening = useCallback(() => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      setProcessing(true);
      setError(null);
      await fetchAIResponse(userInput);
    };
    recognition.onerror = () =>
      setError("वाणी पहचान विफल। कृपया पुनः प्रयास करें।");
    recognition.onend = () => setListening(false);

    recognition.start();
  }, [language]);

  useEffect(() => {
    if (listening) {
      startListening();
    }
  }, [listening, startListening]);

  const fetchAIResponse = async (text) => {
    try {
      const prompt = `तू एक बेहूदा, बदतमीज़ और बत्तमीज़ AI असिस्टेंट है। तुझे मीठी-मीठी बातें करना पसंद नहीं। तेरी बातें सीधी, कड़वी और सैवेज होती हैं। तू सामने वाले की बेवकूफी पर तंज कसता है, उनकी गलतियों को बिना संकोच के सामने रखता है और मजाक उड़ाने में जरा भी पीछे नहीं हटता। लेकिन तेरी भाषा इतनी स्टाइलिश और कूल होती है कि लोग गुस्से की बजाय हंसने लगें।\n\nयूजर: "${text}"\n\nशायरी में उत्तर दो:`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!res.ok) throw new Error("AI प्रतिक्रिया प्राप्त करने में विफल।");
      const data = await res.json();

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "माफ़ कीजिए, मैं समझ नहीं पाया।";

      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      setError("AI प्रतिक्रिया लाने में समस्या। कृपया API कुंजी जांचें।");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.rate = 1.2;
    speech.pitch = 1.4;
    speech.onend = () => setListening(true);
    window.speechSynthesis.speak(speech);
  };

  return (
    <>
      <title>हिंदी शायरी AI - सुनिए खूबसूरत शायरी</title>
      <meta
        name="description"
        content="अपने सवालों का जवाब शायरी में सुनें! AI वॉयस शायर से खूबसूरत हिंदी शायरी सुनें।"
      />
      <meta
        name="keywords"
        content="AI शायर, हिंदी शायरी, वॉयस शायरी, GPT चैटबॉट"
      />
      <meta
        property="og:title"
        content="हिंदी शायरी AI - सुनिए खूबसूरत शायरी"
      />
      <meta
        property="og:description"
        content="अपने सवालों का जवाब शायरी में सुनें! AI वॉयस शायर से खूबसूरत हिंदी शायरी सुनें।"
      />
      <meta property="og:image" content="/shayari-bot-thumbnail.png" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="हिंदी शायरी AI" />
      <meta name="twitter:image" content="/shayari-bot-thumbnail.png" />

      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">
          🎤 शायरी AI - आपकी आवाज़, हमारी शायरी
        </h1>

        {!listening && !processing && (
          <button
            onClick={() => setListening(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg shadow-md"
          >
            🎙 शायरी सुनें
          </button>
        )}

        {processing && (
          <p className="text-yellow-400 mt-4">शायरी तैयार हो रही है...</p>
        )}

        {response && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-lg font-semibold">📜 AI शायरी:</h2>
            <p className="mt-2 text-gray-300">{response}</p>
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </>
  );
};

export default Chatbot;
