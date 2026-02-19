# Página Dinámica Catch-All (`[...slug].astro`)

## ¿Qué es una página catch-all?

En Astro, los archivos dentro de `src/pages/` definen rutas automáticamente. Cuando nombras un archivo con corchetes, creas una **ruta dinámica**:

| Archivo                     | Captura                                    |
| --------------------------- | ------------------------------------------ |
| `src/pages/about.astro`     | Solo `/about`                              |
| `src/pages/[id].astro`      | Un segmento: `/123`, `/abc`                |
| `src/pages/[...slug].astro` | **Cualquier ruta**: `/a`, `/a/b`, `/a/b/c` |

Los `...` (spread) son lo que lo hacen "catch-all": capturan **cero o más segmentos** de la URL.

---

## ¿Cómo funciona la captura?

Cuando el navegador visita una URL, Astro intenta encontrar una página estática primero. Si no existe, cae en `[...slug].astro`.

Lo que llega a `Astro.params.slug` según la URL:

```
/                  → slug = undefined
/about             → slug = "about"
/blog/mi-post      → slug = "blog/mi-post"
/a/b/c/d           → slug = "a/b/c/d"
```

Astro concatena todos los segmentos en un **string separado por `/`**, por eso es útil para sistemas como Storyblok donde el path de una story replica la URL del sitio.

---

## El flujo completo

```
URL: /blog/mi-post
       ↓
Astro no encuentra /blog/mi-post.astro
       ↓
Cae en [...slug].astro
       ↓
Astro.params.slug = "blog/mi-post"
       ↓
storyblokApi.get("cdn/stories/blog/mi-post")
       ↓
Storyblok devuelve la story con ese path
       ↓
<StoryblokComponent> la renderiza
```

---

## ¿Por qué `slug ?? "home"`?

Cuando visitas la raíz `/`, no hay segmentos que capturar, por lo que `slug` es `undefined`.
Sin el fallback `?? "home"` se haría una llamada a `cdn/stories/undefined`, que fallaría.
Con el fallback, se pide la story cuyo path en Storyblok es `"home"`.
