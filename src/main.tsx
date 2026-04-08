import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "@fontsource/dm-sans/300.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import App from "./App.tsx";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing Clerk publishable key.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <App />
  </ClerkProvider>
);
