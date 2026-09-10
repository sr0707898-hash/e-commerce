
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CartContextProvider from "./commponente/cardcontext/cardcontext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartContextProvider>
      <App />
    </CartContextProvider>
  </StrictMode>
);

