import { createBlock } from "@typebot.io/forge";
import { auth } from "./auth";
import { PerplexityDarkLogo, PerplexityLightLogo } from "./logo";

export const perplexityBlock = createBlock({
  id: "perplexity",
  name: "Perplexity",
  tags: [],
  LightLogo: PerplexityLightLogo,
  DarkLogo: PerplexityDarkLogo,
  auth,
  actions: [],
});
