import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CanLogAnalyzer from "./CanLogAnalyzer";
import CanViewer from "./CanViewer";
import DbcEditor from "./DbcEditor";
import J1939DtcAnalyzer from "./J1939DtcAnalyzer";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isDbcEditor = route === "/dbc-editor";
const isCanViewer = route === "/can-viewer";
const isCanLogAnalyzer = route === "/can-log-analyzer";
const isJ1939DtcAnalyzer = route === "/j1939-dtc-decoder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isDbcEditor
      ? <DbcEditor />
      : isCanViewer
        ? <CanViewer />
        : isCanLogAnalyzer
          ? <CanLogAnalyzer />
          : isJ1939DtcAnalyzer
            ? <J1939DtcAnalyzer />
          : <App />}
  </StrictMode>,
);
