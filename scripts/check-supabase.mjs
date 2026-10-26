// Comprueba la conexión con Supabase usando la configuración de .env.
// Solo hace lecturas y operaciones que las políticas RLS deben rechazar,
// así que no modifica los datos. Uso: node scripts/check-supabase.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);
const db = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
let failures = 0;

async function check(name, run) {
  try {
    const detail = await run();
    console.log(`OK    ${name}${detail ? ` → ${detail}` : ''}`);
  } catch (error) {
    failures++;
    console.log(`FALLO ${name} → ${error.message ?? error}`);
  }
}

await check('Leer departments', async () => {
  const { data, error } = await db.from('departments').select('id, name').order('id');
  if (error) throw error;
  if (data.length !== 5) throw new Error(`se esperaban 5 filas y hay ${data.length}`);
  return data.map((d) => d.name).join(', ');
});

await check('Leer incidents con JOIN a departments', async () => {
  const { data, error } = await db
    .from('incidents')
    .select('*, departments(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!data.length) throw new Error('la tabla está vacía');
  return `${data.length} filas; la más reciente: ${data[0].id} (${data[0].departments?.name})`;
});

await check('Título existente (ILIKE, sin mayúsculas)', async () => {
  const { count, error } = await db
    .from('incidents')
    .select('id', { count: 'exact', head: true })
    .ilike('title', 'MONITOR CON PARPADEO');
  if (error) throw error;
  if (count !== 1) throw new Error(`count = ${count}`);
  return 'encontrado';
});

await check('RLS: rechaza crear una incidencia ya cerrada', async () => {
  const { error } = await db.from('incidents').insert({
    id: 'INC-RLS-TEST',
    title: 'Prueba de seguridad RLS',
    description: 'Esta fila no debe llegar a crearse.',
    status: 'closed',
    priority: 'low',
    department_id: 1,
    created_by: 'check',
  });
  if (!error) throw new Error('la inserción se aceptó (¡revisar políticas!)');
  return `rechazado (${error.code})`;
});

await check('RLS: rechaza modificar departments', async () => {
  const { data, error } = await db.from('departments').update({ name: 'Sistemas' }).eq('id', 1).select();
  if (error) return `rechazado (${error.code})`;
  if (data.length) throw new Error('la actualización se aceptó (¡revisar políticas!)');
  return 'rechazado (0 filas afectadas)';
});

await check('Restricción CHECK: estado no válido', async () => {
  const { error } = await db.from('incidents').update({ status: 'inventado' }).eq('id', 'INC-001');
  if (!error) throw new Error('se aceptó un estado no válido');
  return `rechazado (${error.code})`;
});

console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodo correcto');
process.exit(failures ? 1 : 0);
