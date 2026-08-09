import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import NewsPage from "./NewsPage";
import LearnPage from "./LearnPage";
import ToolsPage from "./ToolsPage";
import "./styles.css";

export function renderPage(route: "/" | "/learn/" | "/tools/" | "/blog/" | "/news/") {
  return renderToString(
    <StrictMode>
      {route === "/learn/"
        ? <LearnPage />
        : route === "/tools/"
          ? <ToolsPage />
          : route === "/blog/"
            ? <EngineeringBlog />
            : route === "/news/"
              ? <NewsPage />
              : <App />}
    </StrictMode>,
  );
}
