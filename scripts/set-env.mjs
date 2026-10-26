// Genera src/environments/supabase.config.ts a partir de las variables de entorno
// SUPABASE_URL y SUPABASE_ANON_KEY (o de un archivo .env local).
// Así las claves no se guardan en el repositorio. Se ejecuta antes de start/build/test.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function readDotEnv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
}

const fileEnv = readDotEnv('.env');
const url = process.env.SUPABASE_URL ?? fileEnv.SUPABASE_URL ?? '';
const anonKey = process.env.SUPABASE_ANON_KEY ?? fileEnv.SUPABASE_ANON_KEY ?? '';

if (url && !/^https:\/\/[\w-]+\.supabase\.co\/?$/.test(url)) {
  console.warn(`[set-env] SUPABASE_URL no parece una URL de Supabase: ${url}`);
}

writeFileSync(
  'src/environments/supabase.config.ts',
  `// Archivo generado por scripts/set-env.mjs. No editar ni subir a Git.
export const supabaseConfig = {
  url: ${JSON.stringify(url.replace(/\/$/, ''))},
  anonKey: ${JSON.stringify(anonKey)},
};
`,
);

console.log(
  url && anonKey
    ? `[set-env] Supabase configurado (${url})`
    : '[set-env] Sin Supabase: se usará la API REST simulada',
);
