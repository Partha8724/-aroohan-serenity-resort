// pages/_app.tsx
import "../styles/globals.css";
import "lenis/dist/lenis.css";
import type { AppProps } from "next/app";
import { ScrollProvider } from "../components/ScrollProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ScrollProvider>
      <Component {...pageProps} />
    </ScrollProvider>
  );
}

export default MyApp;
