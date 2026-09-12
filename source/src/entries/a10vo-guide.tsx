import A10voLaGuidePage from "../A10voLaGuidePage";
import { mount } from "./mount";

// Each locale has an indexable static route. Do not auto-redirect by browser language.
const language = window.location.pathname.replace(/\/+$/, "") === "/learn/a10vo-la-power-control" ? "en" : "tr";
mount(<A10voLaGuidePage language={language} />);
