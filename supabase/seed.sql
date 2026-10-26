-- Incidencias360 · Datos sintéticos (generado con scripts/generate-seed.mjs)
-- Ejecutar después de schema.sql. Se puede repetir: vacía y vuelve a cargar.

truncate table public.incidents, public.departments;

insert into public.departments (id, name) values
  (1, 'Sistemas'),
  (2, 'Mantenimiento'),
  (3, 'Recursos Humanos'),
  (4, 'Atención al cliente'),
  (5, 'Logística');

insert into public.incidents (id, title, description, status, priority, department_id, created_at, created_by) values
  ('INC-001', 'Impresora de la planta 2 sin conexión', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'closed', 'high', 1, '2026-05-01T00:01:25.200Z', 'admin'),
  ('INC-002', 'Fallo de acceso a la VPN', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'high', 1, '2026-05-07T23:53:17.253Z', 'tecnico1'),
  ('INC-003', 'Aire acondicionado de la sala de reuniones', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'closed', 'low', 2, '2026-05-14T07:47:32.392Z', 'tecnico2'),
  ('INC-004', 'Portátil no arranca tras actualización', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'low', 1, '2026-05-21T07:14:21.143Z', 'usuario'),
  ('INC-005', 'Fuga de agua en el almacén', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'closed', 'low', 2, '2026-05-25T00:45:20.654Z', 'tecnico2'),
  ('INC-006', 'Error al generar nóminas', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'high', 3, '2026-05-31T22:28:39.312Z', 'usuario'),
  ('INC-007', 'Centralita telefónica con cortes', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'closed', 'high', 1, '2026-06-06T19:36:31.236Z', 'admin'),
  ('INC-008', 'Lector de códigos de barras averiado', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'low', 5, '2026-06-12T11:34:55.398Z', 'usuario'),
  ('INC-009', 'Cuenta de correo bloqueada', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'in-progress', 'high', 1, '2026-06-17T00:03:28.270Z', 'tecnico2'),
  ('INC-010', 'Puerta de emergencia no cierra', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'medium', 2, '2026-06-24T12:17:56.505Z', 'admin'),
  ('INC-011', 'Monitor con parpadeo', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'closed', 'medium', 1, '2026-06-29T19:02:44.124Z', 'tecnico1'),
  ('INC-012', 'Retraso en el envío de pedidos', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'medium', 5, '2026-07-05T14:59:31.812Z', 'usuario'),
  ('INC-013', 'Wifi lento en la zona de oficinas', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'closed', 'low', 1, '2026-07-11T18:16:29.782Z', 'usuario'),
  ('INC-014', 'Solicitud de alta de nuevo empleado', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'low', 3, '2026-07-19T05:25:47.594Z', 'tecnico2'),
  ('INC-015', 'Ascensor de carga detenido', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'closed', 'low', 2, '2026-07-23T10:25:42.838Z', 'tecnico1'),
  ('INC-016', 'Licencia de software caducada', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'high', 1, '2026-07-30T23:40:15.424Z', 'admin'),
  ('INC-017', 'Quejas por tiempos de espera', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'closed', 'low', 4, '2026-08-04T04:24:20.688Z', 'tecnico2'),
  ('INC-018', 'Carretilla elevadora sin batería', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'low', 5, '2026-08-11T03:38:20.730Z', 'usuario'),
  ('INC-019', 'Copia de seguridad fallida', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'closed', 'low', 1, '2026-08-16T12:17:43.310Z', 'tecnico1'),
  ('INC-020', 'Iluminación fundida en el pasillo', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'high', 2, '2026-08-22T00:43:24.169Z', 'admin'),
  ('INC-021', 'Formulario web de contacto caído', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'open', 'medium', 4, '2026-08-28T15:19:10.257Z', 'tecnico2'),
  ('INC-022', 'Error en el inventario semanal', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'in-progress', 'high', 5, '2026-09-02T14:22:45.575Z', 'admin'),
  ('INC-023', 'Ratón inalámbrico sin respuesta', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'open', 'high', 1, '2026-09-09T23:57:38.253Z', 'tecnico2'),
  ('INC-024', 'Calefacción apagada en recepción', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'in-progress', 'high', 2, '2026-09-15T03:52:12.396Z', 'tecnico1'),
  ('INC-025', 'Permisos de carpeta compartida', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'in-progress', 'low', 1, '2026-09-19T17:19:56.100Z', 'admin'),
  ('INC-026', 'Etiquetas de envío mal impresas', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'in-progress', 'low', 5, '2026-09-26T08:48:25.999Z', 'admin'),
  ('INC-027', 'Proyector de formación roto', 'Varios compañeros han informado del mismo fallo desde ayer por la tarde.', 'open', 'high', 2, '2026-10-01T21:38:57.158Z', 'admin'),
  ('INC-028', 'Duplicados en la base de clientes', 'Se necesita una solución antes del cierre de la semana para no bloquear tareas.', 'closed', 'low', 4, '2026-10-07T17:46:34.750Z', 'admin'),
  ('INC-029', 'Teclado con teclas bloqueadas', 'Se detecta el problema al inicio de la jornada y afecta al trabajo del equipo.', 'in-progress', 'low', 1, '2026-10-13T03:27:41.605Z', 'admin'),
  ('INC-030', 'Revisión del extintor del muelle', 'El incidente se repite varias veces al día y requiere revisión técnica.', 'closed', 'low', 2, '2026-10-20T06:20:13.157Z', 'admin');
