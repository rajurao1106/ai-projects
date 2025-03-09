const fetchAIResponse = async (text) => {
  console.log("User input:", text); // Debugging

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
              parts: [{ text: 'You are my long-lost friend from Delhi, India. You are unmarried and working in a web development job. We’re finally reconnecting after a long time! Respond warmly and casually, like an old friend catching up.' }],
            },
          ],
        }),
      }
    );

    if (!res.ok) throw new Error("❌ Trouble connecting to the AI.");

    const data = await res.json();
    console.log("AI Response:", data); // Debugging

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤖 Hmm, I didn’t catch that. Could you try again?";

    setResponse(aiText);
    speak(aiText);
  } catch (error) {
    setError("⚠️ Something went wrong. Let’s try that again!");
  } finally {
    setProcessing(false);
  }
};
