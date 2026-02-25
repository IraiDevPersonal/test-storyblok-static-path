import { storyblok } from "@storyblok/astro";
import { defineConfig, envField } from "astro/config";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { envsConfig } from "./envs.config";

const {
  port,
  isPreview,
  isDevelopment,
  storyblokToken,
  storyblokTokenPreview
} = envsConfig

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
      PORT: envField.number({
        context: "server",
        access: "secret",
        optional: true,
        default: port,
        int: true,
      })
    },
  },
  server: {
    port: isDevelopment ? port : undefined,
  },
  vite: {
    plugins: [isPreview ? mkcert(): [], tailwindcss()],
    server: {
      https: isPreview,
    },
  },
  integrations: [
    storyblok({
      accessToken: isPreview ? storyblokTokenPreview : storyblokToken,
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
        card: "storyblok/Card",
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
