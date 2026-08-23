import GuidePage, { type GuideSlug } from "../GuidePage";
import { mount } from "./mount";

const slug = window.location.pathname.split("/").filter(Boolean).at(-1) as GuideSlug;
mount(<GuidePage slug={slug} />);
