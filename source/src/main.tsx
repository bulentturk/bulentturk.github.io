import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import DbcEditor from "./DbcEditor";
import "./styles.css";

const isDbcEditor = window.location.pathname.replace(/\/+$/, "") === "/dbc-editor";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isDbcEditor ? <DbcEditor /> : <App />}
  </StrictMode>,
);
