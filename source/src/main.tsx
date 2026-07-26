import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CanViewer from "./CanViewer";
import DbcEditor from "./DbcEditor";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isDbcEditor = route === "/dbc-editor";
const isCanViewer = route === "/can-viewer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isDbcEditor ? <DbcEditor /> : isCanViewer ? <CanViewer /> : <App />}
  </StrictMode>,
);
