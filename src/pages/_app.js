import "../app/"; // ✅ Import Tailwind styles

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;