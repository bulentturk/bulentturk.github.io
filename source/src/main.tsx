import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CanLogAnalyzer from "./CanLogAnalyzer";
import CanViewer from "./CanViewer";
import DbcEditor from "./DbcEditor";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isDbcEditor = route === "/dbc-editor";
const isCanViewer = route === "/can-viewer";
const isCanLogAnalyzer = route === "/can-log-analyzer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isDbcEditor
      ? <DbcEditor />
      : isCanViewer
        ? <CanViewer />
        : isCanLogAnalyzer
          ? <CanLogAnalyzer />
          : <App />}
  </StrictMode>,
);
