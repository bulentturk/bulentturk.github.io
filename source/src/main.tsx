import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import NewsPage from "./NewsPage";
import LearnPage from "./LearnPage";
import ToolsPage from "./ToolsPage";
import CanLogAnalyzer from "./CanLogAnalyzer";
import CanViewer from "./CanViewer";
import DbcEcuSimulator from "./DbcEcuSimulator";
import DbcEditor from "./DbcEditor";
import J1939DtcAnalyzer from "./J1939DtcAnalyzer";
import HydraulicSimulator from "./HydraulicSimulator";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isDbcEditor = route === "/dbc-editor";
const isCanViewer = route === "/can-viewer";
const isDbcEcuSimulator = route === "/dbc-ecu-simulator";
const isCanLogAnalyzer = route === "/can-log-analyzer";
const isJ1939DtcAnalyzer = route === "/j1939-dtc-decoder";
const isEngineeringBlog = route === "/blog";
const isNews = route === "/news";
const isLearn = route === "/learn";
const isToolsHub = route === "/tools";
const isHydraulicSimulator = route === "/hydraulic-simulator";

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    {isDbcEditor
      ? <DbcEditor />
      : isDbcEcuSimulator
        ? <DbcEcuSimulator />
      : isCanViewer
        ? <CanViewer />
      : isCanLogAnalyzer
        ? <CanLogAnalyzer />
        : isJ1939DtcAnalyzer
          ? <J1939DtcAnalyzer />
          : isHydraulicSimulator
            ? <HydraulicSimulator />
          : isLearn
            ? <LearnPage />
          : isToolsHub
            ? <ToolsPage />
          : isEngineeringBlog
            ? <EngineeringBlog />
          : isNews
            ? <NewsPage />
          : <App />}
  </StrictMode>
);

if (!isDbcEditor && !isDbcEcuSimulator && !isCanViewer && !isCanLogAnalyzer && !isJ1939DtcAnalyzer && !isHydraulicSimulator && root.hasChildNodes()) {
  hydrateRoot(root, application);
} else {
  createRoot(root).render(application);
}
