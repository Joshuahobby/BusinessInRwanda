import { createRoot } from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </Helmet>
    <App />
  </HelmetProvider>
);
