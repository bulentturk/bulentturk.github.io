import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
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
import GuidePage from "./GuidePage";
import "./styles.css";

export type RenderRoute =
  | "/"
  | "/learn/"
  | "/tools/"
  | "/blog/"
  | "/news/"
  | "/learn/dbc-dosyasi-nedir/"
  | "/learn/can-log-analizi/"
  | "/learn/dbc-ile-ecu-simulasyonu/"
  | "/dbc-editor/"
  | "/can-viewer/"
  | "/dbc-ecu-simulator/"
  | "/can-log-analyzer/"
  | "/j1939-dtc-decoder/";

function pageForRoute(route: RenderRoute) {
  switch (route) {
    case "/dbc-editor/": return <DbcEditor />;
    case "/can-viewer/": return <CanViewer />;
    case "/dbc-ecu-simulator/": return <DbcEcuSimulator />;
    case "/can-log-analyzer/": return <CanLogAnalyzer />;
    case "/j1939-dtc-decoder/": return <J1939DtcAnalyzer />;
    case "/learn/dbc-dosyasi-nedir/": return <GuidePage slug="dbc-dosyasi-nedir" />;
    case "/learn/can-log-analizi/": return <GuidePage slug="can-log-analizi" />;
    case "/learn/dbc-ile-ecu-simulasyonu/": return <GuidePage slug="dbc-ile-ecu-simulasyonu" />;
    case "/learn/": return <LearnPage />;
    case "/tools/": return <ToolsPage />;
    case "/blog/": return <EngineeringBlog />;
    case "/news/": return <NewsPage />;
    default: return <App />;
  }
}

export function renderPage(route: RenderRoute) {
  return renderToString(
    <StrictMode>{pageForRoute(route)}</StrictMode>,
  );
}
