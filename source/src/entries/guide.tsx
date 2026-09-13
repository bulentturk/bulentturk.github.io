import GuidePage, { type GuideSlug } from "../GuidePage";
import DbcGuidePage from "../DbcGuidePage";
import { mount } from "./mount";

const slug = window.location.pathname.split("/").filter(Boolean).at(-1) as GuideSlug;
mount(slug === "dbc-dosyasi-nedir" ? <DbcGuidePage /> : <GuidePage slug={slug} />);
