import { generateSafelist } from './src/lib/utils/sanitized-card.js';

// HTML de ejemplo que puede venir de Storyblok (puedes expandir esto)
const storyblokExamples = [
  `<article class="w-full rounded-2xl border border-neutral-700 bg-neutral-900 shadow-lg shadow-neutral-100/5 p-4 space-y-4">
    <header class="flex items-center gap-x-2">
      <img src="{{thumbnailUrl}}" alt="{{title}}" class="size-10 object-cover aspect-square rounded-full" />
      <h2 class="text-xl font-semibold">{{title}}</h2>
    </header>
    <section class="flex gap-x-4">
      <img class="size-40 object-center object-cover aspect-square text-neutral-500 text-xs rounded-xl" src="{{imageSrc}}" alt="{{title}}" />
      <p class="text-sm text-neutral-400 text-justify">Content here</p>
    </section>
  </article>`
];

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  safelist: [
    // Clases estáticas que conocemos
    "w-full", "rounded-2xl", "border", "border-neutral-700",
    "bg-neutral-900", "shadow-lg", "shadow-neutral-100/5",
    "p-4", "space-y-4", "flex", "items-center", "gap-x-2",
    "size-10", "object-cover", "aspect-square", "rounded-full",
    "text-xl", "font-semibold", "gap-x-4", "size-40",
    "object-center", "text-neutral-500", "text-xs", "rounded-xl",
    "text-sm", "text-neutral-400", "text-justify",
    // Clases extraídas dinámicamente del contenido de Storyblok
    ...generateSafelist(storyblokExamples)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
