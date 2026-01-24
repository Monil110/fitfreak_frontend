import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { registerLicense } from "@syncfusion/ej2-base";
import App from "./App.tsx";
import "./index.css";



import "@syncfusion/ej2-base/styles/material.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);