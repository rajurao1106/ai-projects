import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About AI Chatbot</title>
        <meta name="description" content="AI वॉयस चैटबॉट के बारे में जानकारी प्राप्त करें।" />
        <meta name="keywords" content="AI, About Chatbot, Voice Assistant" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">ℹ️ AI Chatbot के बारे में</h1>
        <p>यह प्रोजेक्ट वास्तविक समय में वाणी पहचानने और उत्तर देने के लिए AI का उपयोग करता है।</p>
      </div>
    </>
  );
}
