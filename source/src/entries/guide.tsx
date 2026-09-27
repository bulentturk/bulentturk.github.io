// Guide routes use this entry instead of main.tsx, so the shared site
// chrome (header tokens, brand, navigation and language switch) from
// home.css has to be loaded here as well. It comes first so guide-page.css
// stays the last word for the guide surfaces.
import "../home.css";
import GuidePage, { type GuideSlug } from "../GuidePage";
import DbcGuidePage from "../DbcGuidePage";
import { mount } from "./mount";

const slug = window.location.pathname.split("/").filter(Boolean).at(-1) as GuideSlug;
mount(slug === "dbc-dosyasi-nedir" ? <DbcGuidePage /> : <GuidePage slug={slug} />);
