import sanitizeHtml from "sanitize-html";

export function sanitizedCard(htmlText: string): string {
  return sanitizeHtml(htmlText, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedClasses: {
      "*": ["*"],
    },
    // Opciones de limpieza de espacios y saltos de línea
    textFilter: (text) => {
      // Limpiar espacios múltiples y saltos de línea en nodos de texto
      return text
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
        .replace(/\n\s*\n/g, "\n") // Eliminar líneas vacías múltiples
        .trim(); // Eliminar espacios al inicio y final
    },
    // Eliminar espacios en blanco alrededor de las etiquetas
    disallowedTagsMode: "discard",
    exclusiveFilter: (frame) => {
      if (frame.tag === "img") {
        const src = frame.attribs?.src;
        const alt = frame.attribs?.alt;

        const isValidSrc = src === "{{imageSrc}}";
        const isValidAlt = alt === "{{title}}";
        const isValidThumbnailSrc = src === "{{thumbnailUrl}}";

        if ((!isValidSrc && !isValidThumbnailSrc) || !isValidAlt) {
          console.error(
            "Invalid img tag: only src='{{imageSrc}}' or src='{{thumbnailUrl}}' and alt='{{title}}' are allowed",
            {
              src,
              alt,
            },
          );
          return true;
        }
      }
      return false;
    },
  });
}

export function getClassTokens(htmlText: string): string[] {
  return [...htmlText.matchAll(/\bclass="([^"]+)"/g)]
    .map((match) => match[1].split(/\s+/))
    .flat();
}