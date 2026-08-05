import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import NewsPage from "./NewsPage";
import "./styles.css";

export function renderPage(route: "/" | "/blog/" | "/news/") {
  return renderToString(
    <StrictMode>
      {route === "/blog/" ? <EngineeringBlog /> : route === "/news/" ? <NewsPage /> : <App />}
    </StrictMode>,
  );
}
