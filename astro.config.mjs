import { storyblok } from "@storyblok/astro";
import { defineConfig } from "astro/config";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
// import vercel from "@astrojs/vercel";
import { loadEnv } from "vite";

const { STORYBLOK_TOKEN_PREVIEW, IS_LOCAL } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  "",
);
const isLocal = IS_LOCAL === "true";

export default defineConfig({
  vite: {
    plugins: [isLocal && mkcert(), tailwindcss()],
    server: {
      https: isLocal,
    },
  },
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
        text_image_section: "storyblok/TextImageSection",
        header_section: "storyblok/HeaderSection",
        action_hero_section: "storyblok/ActionHeroSection",
      },
    }),
  ],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
