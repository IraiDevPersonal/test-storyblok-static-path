import { storyblok } from "@storyblok/astro";
import { defineConfig } from "astro/config";
import mkcert from "vite-plugin-mkcert";
import { loadEnv } from "vite";

const { STORYBLOK_TOKEN_PREVIEW, IS_LOCAL } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  "",
);
const isLocal = IS_LOCAL === "true";

export default defineConfig({
  integrations: [
    storyblok({
      accessToken: STORYBLOK_TOKEN_PREVIEW,
      apiOptions: {
        region: "eu",
      },
      livePreview: true,
      enableFallbackComponent: true,
      components: {
        default_page: "storyblok/DefaultPage",
        hero_section: "storyblok/HeroSection",
      },
    }),
  ],
  ...(isLocal && {
    vite: {
      server: {
        https: true,
      },
      plugins: [mkcert()],
    },
  }),
  output: "server",
});
