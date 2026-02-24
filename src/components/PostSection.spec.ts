import { test, expect } from "@playwright/test";

test("PostSection se renderiza en /about y muestra el contador de items", async ({ page }) => {
  await page.goto("/about");

  // Verificamos el título del bloque (señal de que el componente se renderizó).
  await expect(page.getByRole("heading", { name: "Últimos posts" })).toBeVisible();

  // El contador debe mostrar un número y el texto "items".
  // No fijamos el número exacto porque en /about depende del fetch server-side.
  await expect(page.getByText(/\d+ items/)).toBeVisible();
});
