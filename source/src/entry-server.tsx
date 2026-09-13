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
import J1939PgnCalculator from "./J1939PgnCalculator";
import GuidePage from "./GuidePage";
import DbcGuidePage from "./DbcGuidePage";
import A10voLaGuidePage from "./A10voLaGuidePage";
import "./styles.css";

export type RenderRoute =
  | "/"
  | "/learn/"
  | "/tools/"
  | "/blog/"
  | "/news/"
  | "/learn/dbc-dosyasi-nedir/"
  | "/learn/can-bus-ariza-tespiti/"
  | "/learn/can-log-analizi/"
  | "/learn/j1939-pgn-nedir/"
  | "/learn/j1939-dm1-spn-fmi-cozumleme/"
  | "/learn/dbc-ile-ecu-simulasyonu/"
  | "/learn/a10vo-la-guc-kontrolu/"
  | "/learn/a10vo-la-power-control/"
  | "/dbc-editor/"
  | "/can-viewer/"
  | "/dbc-ecu-simulator/"
  | "/can-log-analyzer/"
  | "/j1939-dtc-decoder/"
  | "/j1939-pgn-calculator/";

function pageForRoute(route: RenderRoute) {
  switch (route) {
    case "/dbc-editor/": return <DbcEditor />;
    case "/can-viewer/": return <CanViewer />;
    case "/dbc-ecu-simulator/": return <DbcEcuSimulator />;
    case "/can-log-analyzer/": return <CanLogAnalyzer />;
    case "/j1939-dtc-decoder/": return <J1939DtcAnalyzer />;
    case "/j1939-pgn-calculator/": return <J1939PgnCalculator />;
    case "/learn/dbc-dosyasi-nedir/": return <DbcGuidePage />;
    case "/learn/can-bus-ariza-tespiti/": return <GuidePage slug="can-bus-ariza-tespiti" />;
    case "/learn/can-log-analizi/": return <GuidePage slug="can-log-analizi" />;
    case "/learn/j1939-pgn-nedir/": return <GuidePage slug="j1939-pgn-nedir" />;
    case "/learn/j1939-dm1-spn-fmi-cozumleme/": return <GuidePage slug="j1939-dm1-spn-fmi-cozumleme" />;
    case "/learn/dbc-ile-ecu-simulasyonu/": return <GuidePage slug="dbc-ile-ecu-simulasyonu" />;
    case "/learn/a10vo-la-guc-kontrolu/": return <A10voLaGuidePage language="tr" />;
    case "/learn/a10vo-la-power-control/": return <A10voLaGuidePage language="en" />;
    case "/learn/": return <LearnPage />;
    case "/tools/": return <ToolsPage />;
    case "/blog/": return <EngineeringBlog />;
    case "/news/": return <NewsPage />;
    default: return <App />;
  }
}

export function renderPage(route: RenderRoute) {
  return renderToString(<StrictMode>{pageForRoute(route)}</StrictMode>);
}
