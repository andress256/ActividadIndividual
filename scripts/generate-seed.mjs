// Genera supabase/seed.sql a partir de los datos sintéticos de src/assets/api.
// Uso: node scripts/generate-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => JSON.parse(readFileSync(`src/assets/api/${name}.json`, 'utf8'));
const sql = (value) => (typeof value === 'number' ? String(value) : `'${String(value).replace(/'/g, "''")}'`);

const departments = read('departments');
const incidents = read('incidents');

const lines = [
  '-- Incidencias360 · Datos sintéticos (generado con scripts/generate-seed.mjs)',
  '-- Ejecutar después de schema.sql. Se puede repetir: vacía y vuelve a cargar.',
  '',
  'truncate table public.incidents, public.departments;',
  '',
  'insert into public.departments (id, name) values',
  departments.map((d) => `  (${sql(d.id)}, ${sql(d.name)})`).join(',\n') + ';',
  '',
  'insert into public.incidents (id, title, description, status, priority, department_id, created_at, created_by) values',
  incidents
    .map(
      (i) =>
        `  (${[i.id, i.title, i.description, i.status, i.priority, i.departmentId, i.createdAt, i.createdBy].map(sql).join(', ')})`,
    )
    .join(',\n') + ';',
  '',
];

writeFileSync('supabase/seed.sql', lines.join('\n'));
console.log(`seed.sql: ${departments.length} departamentos, ${incidents.length} incidencias`);
