import { storyblok } from "@storyblok/astro";
import { defineConfig, envField } from "astro/config";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { loadEnv } from "vite";

const { STORYBLOK_TOKEN_PREVIEW, STORYBLOK_TOKEN, IS_PREVIEW } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  "",
);
const isPreview = IS_PREVIEW === "true";

export default defineConfig({
  env: {
    schema: {
      STORYBLOK_TOKEN: envField.string({ context: "server", access: "secret" }),
      STORYBLOK_TOKEN_PREVIEW: envField.string({
        context: "server",
        access: "secret",
      }),
      IS_PREVIEW: envField.boolean({
        context: "server",
        access: "secret",
        optional: true,
        default: false,
      }),
    },
  },
  vite: {
    plugins: [isPreview && mkcert(), tailwindcss()],
    server: {
      https: isPreview,
    },
  },
  integrations: [
    storyblok({
      accessToken: isPreview ? STORYBLOK_TOKEN_PREVIEW : STORYBLOK_TOKEN,
      apiOptions: {
        region: "eu",
      },
      livePreview: isPreview,
      enableFallbackComponent: isPreview,
      components: {
        default_page: "storyblok/DefaultPage",
        hero_section: "storyblok/HeroSection",
        text_image_section: "storyblok/TextImageSection",
        header_section: "storyblok/HeaderSection",
        action_hero_section: "storyblok/ActionHeroSection",
      },
    }),
  ],
  ...(isPreview && {
    output: "server",
    adapter: node({
      mode: "standalone",
    }),
  }),
});
