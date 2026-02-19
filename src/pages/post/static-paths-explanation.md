# Rutas estáticas dinámicas en Astro

Este documento explica cómo funciona el archivo `[id].astro` y los conceptos de Astro necesarios para entenderlo.

---

## Rutas dinámicas (`[id].astro`)

El nombre del archivo entre corchetes (`[id]`) indica a Astro que esta es una **ruta dinámica**. El segmento `id` actúa como un parámetro de URL:

| URL visitada | Valor de `params.id` |
| ------------ | -------------------- |
| `/post/1`    | `"1"`                |
| `/post/42`   | `"42"`               |

---

## `prerender = true`

```ts
export const prerender = true;
```

Le indica a Astro que genere esta página como **HTML estático en tiempo de build**, no en tiempo de request.

- **Con `prerender = true`**: Astro llama a `getStaticPaths` durante el build y genera un archivo `.html` por cada path devuelto.
- **Sin `prerender`** (o con `false`): la página se renderiza en el servidor en cada request (SSR). En ese caso `getStaticPaths` no existe; en cambio se usa `Astro.params` directamente.

> En proyectos configurados con `output: 'static'`, todas las páginas son prerenderizadas por defecto y no necesitan esta línea. Es obligatoria cuando el modo de output es `'server'` o `'hybrid'` y se quiere prerenderizar una página específica.

---

## `getStaticPaths()`

```ts
export async function getStaticPaths() {
  const posts = await fetchPosts();

  return posts.map((post) => ({
    params: { id: post.id.toString() },
    props: { post },
  }));
}
```

Función **exportada y asíncrona** que Astro ejecuta **una sola vez en tiempo de build**.

### Qué debe retornar

Un array de objetos con esta forma:

```ts
{
  params: { id: string }, // debe coincidir con el nombre del archivo [id]
  props: { post: PostModel } // datos disponibles en Astro.props
}
```

### `params`

Define los segmentos de URL que se generarán. La clave debe coincidir exactamente con el nombre del parámetro en el archivo (`[id]` → clave `id`).

### `props`

Datos que Astro inyecta como props en la página. Se accede a ellos con `Astro.props`. Esto evita tener que volver a llamar a la API dentro del template.

---

## Flujo completo en tiempo de build

```
fetchPosts() → [ post1, post2, ... postN ]
       ↓
getStaticPaths() devuelve paths con params y props
       ↓
Astro genera /post/1.html, /post/2.html, ... /post/N.html
       ↓
Cada página recibe su `post` vía Astro.props
```

---

## Acceso a los props en el template

```astro
const { post } = Astro.props;
```

`Astro.props` contiene los `props` definidos en `getStaticPaths` para ese path concreto. El tipo se declara con `type Props` para obtener autocompletado y validación de TypeScript.

---

## Resumen

| Concepto           | Para qué sirve                                                      |
| ------------------ | ------------------------------------------------------------------- |
| `[id].astro`       | Define una ruta dinámica con el parámetro `id`                      |
| `prerender = true` | Fuerza la generación estática de esta página en el build            |
| `getStaticPaths()` | Indica a Astro qué paths generar y qué datos pasar a cada uno       |
| `params`           | Valores del segmento de URL (ej. `id`)                              |
| `props`            | Datos pasados a la página para evitar llamadas extra a la API       |
| `Astro.props`      | Objeto donde se accede a los `props` devueltos por `getStaticPaths` |
