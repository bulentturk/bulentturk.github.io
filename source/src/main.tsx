import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import NewsPage from "./NewsPage";
import LearnPage from "./LearnPage";
import ToolsPage from "./ToolsPage";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isEngineeringBlog = route === "/blog";
const isNews = route === "/news";
const isLearn = route === "/learn";
const isToolsHub = route === "/tools";

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    {isLearn
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

if (root.hasChildNodes()) {
  hydrateRoot(root, application);
} else {
  createRoot(root).render(application);
}
