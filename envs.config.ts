import { z } from "astro/zod";
import { loadEnv } from "vite";

const NODE_ENV: string = process.env.NODE_ENV ?? "development";

const envsSchema = z.object({
  STORYBLOK_TOKEN: z.string().min(1),
  STORYBLOK_TOKEN_PREVIEW: z.string().min(1),
  PORT: z.coerce.number().int().optional().default(1234),
  IS_PREVIEW: z.enum(['true', 'false']).optional().default('false'),
})

function parseEnvs(): z.infer<typeof envsSchema> {
  const raw = loadEnv(NODE_ENV, process.cwd(), '')
  const result = envsSchema.safeParse(raw)

  if (!result.success) {
    console.error('ERROR FROM: envs.config.ts\n')
    console.error('Details:\n', result.error.errors)
    process.exit(1)
  }

  return result.data
}

const envs = parseEnvs()

type EnvConfig = {
  port: number
  storyblokToken: string
  isPreview: boolean
  isDevelopment: boolean
  storyblokTokenPreview: string
}

export const envsConfig: EnvConfig = {
  port: envs.PORT,
  storyblokToken: envs.STORYBLOK_TOKEN,
  isPreview: envs.IS_PREVIEW === "true",
  isDevelopment: NODE_ENV === "development",
  storyblokTokenPreview: envs.STORYBLOK_TOKEN_PREVIEW,
}