import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import NewsPage from "./NewsPage";
import LearnPage from "./LearnPage";
import ToolsPage from "./ToolsPage";
import LegalPage from "./LegalPage";
import "./styles.css";

const route = window.location.pathname.replace(/\/+$/, "");
const isEngineeringBlog = route === "/blog";
const isNews = route === "/news";
const isLearn = route === "/learn";
const isToolsHub = route === "/tools";
const isLegal = route === "/gizlilik-politikasi" || route === "/cerez-politikasi" || route === "/kvkk-aydinlatma-metni";
let legalSlug: "gizlilik-politikasi" | "cerez-politikasi" | "kvkk-aydinlatma-metni" | null = null;
if (isLegal) {
  legalSlug = route.slice(1) as "gizlilik-politikasi" | "cerez-politikasi" | "kvkk-aydinlatma-metni";
}

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    {legalSlug
      ? <LegalPage slug={legalSlug} />
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

if (root.hasChildNodes()) {
  hydrateRoot(root, application);
} else {
  createRoot(root).render(application);
}
