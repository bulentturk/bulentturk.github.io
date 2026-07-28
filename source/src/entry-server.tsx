import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import EngineeringBlog from "./EngineeringBlog";
import "./styles.css";

export function renderPage(route: "/" | "/blog/") {
  return renderToString(
    <StrictMode>
      {route === "/blog/" ? <EngineeringBlog /> : <App />}
    </StrictMode>,
  );
}
