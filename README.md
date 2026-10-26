# Incidencias360

Sistema de gestión de incidencias internas para un entorno empresarial, desarrollado como
aplicación multiplataforma (PWA/híbrida) con **Ionic 9 + Angular 22 (standalone)**.

Proyecto de la *Actividad individual 1* del módulo **Desarrollo de Interfaces (0488)**, 2.º DAM.
Autor: Andrés Fernández Benito.

- **Aplicación en producción:** _pendiente de despliegue_
- **Repositorio:** _pendiente_
- **Documentación técnica (Compodoc):** `/docs` dentro de la aplicación desplegada

> Todos los datos de la aplicación son sintéticos. Las credenciales de prueba se entregan
> aparte (no se publican en el repositorio).

---

## Funcionalidades

| Requisito | Implementación |
|---|---|
| Navegación global con Lazy Loading | Menú lateral (`ion-menu`) y rutas con `loadComponent` |
| Control de acceso por roles | `authGuard` y `roleGuard('admin')`; roles Administrador y Usuario estándar |
| Token e interceptor HTTP | JWT simulado guardado en `localStorage` y `authInterceptor` que añade `Authorization: Bearer` |
| Formularios reactivos | Login y alta/edición de incidencias con `FormBuilder` y validadores |
| Validación asíncrona | `uniqueTitleValidator` consulta la API para impedir títulos duplicados |
| Data binding | Unidireccional (`[prop]`, `{{ }}`) y bidireccional (`[(ngModel)]`, `[(search)]` con `model()`) |
| Componentes reutilizables | `app-incident-table`, `app-stat-card`, `app-chart-widget`, `app-export-buttons` con `@Input`/`@Output` |
| Asincronía y concurrencia | RxJS; `forkJoin` para cargar a la vez la API SQL y el feed NoSQL |
| Fuente SQL (REST) | **Supabase (PostgreSQL)** vía PostgREST: tablas `incidents` y `departments` con clave foránea, JOIN, índice único y RLS |
| Fuente NoSQL en tiempo real | `ActivityFeedService`: Firestore si está configurado; si no, feed local con RxJS sincronizado entre pestañas |
| Dashboard | Cuadro de mando del administrador con Chart.js y filtros en tiempo real |
| Exportación | Informes PDF (jsPDF + autotable) y CSV (UTF-8, compatible con Excel) |
| Responsive | Mobile-first con `ion-grid`, CSS Grid y Flexbox |
| Accesibilidad WCAG | Contraste AA, skip link, foco visible y gestionado, ARIA, zoom, `prefers-reduced-motion` |
| Documentación | Compodoc, página de Ayuda en la app y este README |
| Calidad y despliegue | Tests unitarios (Vitest), GitHub Actions y Vercel |

## Arquitectura (MVVM)

```text
src/app/
├── core/
│   ├── guards/          authGuard, roleGuard
│   ├── interceptors/    authInterceptor (Bearer token)
│   ├── services/        auth, token-storage, incident-api (SQL), activity-feed (NoSQL), report-export
│   └── validators/      uniqueTitleValidator (asíncrono)
├── models/              Incident, Department, Activity, IncidentFilter, AppUser
├── shared/components/   incident-table, stat-card, chart-widget, export-buttons
├── pages/               auth/login, dashboard, incidents (lista y formulario), help
├── app.config.ts        providers (router, HttpClient + interceptor, fuente NoSQL)
└── app.routes.ts        rutas lazy protegidas por guards
```

- **Modelo:** interfaces en `models/` y datos en `src/assets/api/*.json`.
- **Vista:** plantillas declarativas de Ionic/Angular.
- **ViewModel:** estado de cada página con *signals* (`signal`, `computed`) y servicios inyectados.

### Fuentes de datos

- **SQL (API REST):** `IncidentRepository` es una clase abstracta con dos implementaciones:
  - `SupabaseIncidentService`: base de datos **PostgreSQL en Supabase**, consultada por su API REST
    (PostgREST) con `@supabase/supabase-js`. Hace el JOIN `incidents → departments` en el servidor.
    El esquema está en `supabase/schema.sql` y los datos sintéticos en `supabase/seed.sql`.
  - `IncidentApiService`: API REST simulada (JSON en `assets/api` y escrituras en `localStorage`).
    Se usa automáticamente si no hay claves de Supabase, por ejemplo en el CI.
- **NoSQL en tiempo real:** `ActivityFeedService` es una clase abstracta con dos implementaciones.
  Si `environment.firebase.projectId` tiene valor se usa **Firebase Firestore** (`onSnapshot`);
  si no, `LocalActivityFeedService` mantiene el feed con un `BehaviorSubject` y lo sincroniza
  entre pestañas con el evento `storage`.

### Seguridad

- No hay contraseñas en claro en el código: solo hashes SHA-256 de las contraseñas de prueba.
- Las claves de Supabase no están en el repositorio: se leen de `.env` (local) o de las variables
  de entorno de Vercel y `scripts/set-env.mjs` genera `src/environments/supabase.config.ts`
  (ignorado por Git) antes de cada build.
- Supabase tiene Row Level Security activado: con la clave pública se puede leer, crear y
  actualizar incidencias, pero no borrarlas ni modificar los departamentos.
- El JWT es simulado (sin firma). La protección real de datos requeriría validación en el servidor.
- La configuración web de Firebase es pública por diseño; no se incluyen claves privadas.

## Instalación y ejecución

Requisitos: Node.js 24.15 o superior (incluye npm 11, necesario para `npm ci` con este `package-lock.json`).

```bash
npm ci
npm start            # http://localhost:4200
```

| Script | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción en `www/` |
| `npm run build:prod` | Build + documentación Compodoc en `www/docs` (lo usa Vercel) |
| `npm test` | Tests unitarios (Vitest) |
| `npm run lint` | ESLint |
| `npm run docs` | Genera la documentación en `documentation/` |
| `npm run docs:serve` | Documentación con servidor local |
| `npm run db:seed` | Regenera `supabase/seed.sql` a partir de `src/assets/api/*.json` |

### Configurar Supabase (base de datos SQL)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta `supabase/schema.sql` y después `supabase/seed.sql`.
3. En **Project Settings → API** copia la *Project URL* y la clave **anon public**.
4. En local: copia `.env.example` como `.env` y rellena `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
5. En Vercel: añade esas dos variables en *Settings → Environment Variables* y vuelve a desplegar.

Al arrancar o compilar se muestra `[set-env] Supabase configurado`. En la app, **Ayuda → Datos
y privacidad** indica qué fuente SQL está activa.

### Configurar Firebase (opcional)

1. Crea un proyecto en Firebase y una base de datos Firestore.
2. Copia la configuración web (`apiKey`, `authDomain`, `projectId`, `appId`) en
   `src/environments/environment.ts` y `environment.prod.ts`.
3. Crea la colección `activity` con reglas que permitan leer y crear documentos.

Sin este paso la aplicación funciona igual con el feed local.

## Control de versiones

Flujo Git Flow:

- `main`: versiones entregables.
- `develop`: integración.
- `feature/*`: una rama por funcionalidad, integrada en `develop` con merge `--no-ff`
  (`feature/project-setup`, `feature/auth-routing`, `feature/data-sources-validation`,
  `feature/dashboard-components`, `feature/report-export`, `feature/accessibility-responsive`,
  `feature/documentation-help`, `feature/ci-deployment`, `feature/supabase`).

## Integración continua y despliegue

- **GitHub Actions** (`.github/workflows/ci.yml`): en cada push y pull request a `main` y `develop`
  ejecuta `npm ci`, lint, tests, build de producción y Compodoc. Si algo falla, el job falla.
- **Vercel** (`vercel.json`): ejecuta `npm run build:prod`, publica `www/` y redirige las rutas de
  la SPA a `index.html`. Cada push a `main` despliega en producción.

---

## Manual de usuario

El manual completo también está dentro de la aplicación, en **Menú → Ayuda**.

### 1. Iniciar sesión

Abre la aplicación, escribe usuario y contraseña y pulsa **Entrar**.

- El **Administrador** entra al *Cuadro de mando*.
- El **Usuario estándar** entra al listado de *Incidencias*.

Para cambiar de página usa el botón **☰** de la barra superior. **Cerrar sesión** está al final
del menú.

### 2. Consultar incidencias

En **Incidencias** se muestra una tabla con código, título, departamento, prioridad, estado y fecha.

- **Buscar:** escribe en el buscador (título, código o departamento).
- **Ordenar:** pulsa el encabezado de una columna; otra pulsación invierte el orden.
- **Paginar:** botones *Anterior* y *Siguiente*.
- **Editar:** pulsa el título de una incidencia.

### 3. Crear o editar una incidencia

Pulsa **Nueva incidencia** y rellena título, descripción, prioridad y departamento.
Mientras escribes el título la aplicación comprueba que no exista ya (*Comprobando…*).
Al editar, también puedes cambiar el **estado**: Abierta, En curso o Cerrada.

### 4. Cuadro de mando (solo Administrador)

- Filtros por texto, estado, prioridad y rango de fechas, aplicados al instante.
- Tarjetas con el total y el número de incidencias por estado. Al pulsarlas se filtra por ese estado.
- Gráficos por estado, por prioridad y por mes. Al pulsar un sector se aplica el filtro.
- **Actividad en tiempo real** con los últimos cambios.

### 5. Exportar informes

Los botones **Exportar PDF** y **Exportar CSV** descargan los registros visibles con los filtros
aplicados. El PDF incluye la fecha, los filtros, un resumen y la tabla paginada.

### 6. Accesibilidad

- `Tab` muestra el enlace *Saltar al contenido principal*.
- Toda la aplicación se maneja con teclado.
- Admite zoom del navegador, modo oscuro y reducción de animaciones.
