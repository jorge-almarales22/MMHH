# AGENTS.md

## Architecture
- Active app: `mmhh-react/` — React 18 + Vite + Tailwind. Edit `mmhh-react/src/`, never the compiled output
- `mmhh-react/dist/` is committed on purpose: the deploy is a plain copy of that folder (no npm at the target). Run `npm run build` and commit `dist/` with any source change
- `index.aspx` at the repo root is the superseded single-file version (JSX transpiled in-browser by Babel standalone). Kept for reference; new work does not go there
- Data layer: SharePoint REST API (`_api/web/lists/getbytitle('MMHH_DB')/items`). Every field lives inside one JSON string in the list's `Data` column
- Auth: auto-detects SharePoint user via `_api/web/currentuser`; falls back to hardcoded dev mode when running outside SharePoint
- Images stored as base64 strings inside that same `Data` JSON — large images may exceed SharePoint's field size limit
- No tests, no CI, no linting/formatting config

## The `Data` JSON shape
Everything is one JSON blob, so old and new records coexist in the same list. Read
through the normalizers in `src/utils/helpers.js` rather than touching raw fields:
- `Trabajos[]` — what the client asked for; one `{ Soporte, TipoRequerimiento }` per row.
  Legacy records instead had a single `Soporte` plus a `TipoRequerimiento[]` of checked
  boxes; `getTrabajos()` folds those into the same shape. `Soporte`/`TipoRequerimiento`
  are still written flat alongside it because filters, search and the CSV read them
- A trabajo the coordinator rejected carries `Descartado: { Motivo, Autor, Fecha }` — it is
  struck through, never deleted, so the client sees the reason. `trabajosVigentes()` skips them
- `Coordinador.Procesos[]` — each process carries its own `Realizado`, `HorasReales` and
  `Comentarios[]`. Older processes lack those three; `normalizarProceso()` fills the defaults
  so controlled inputs never receive `undefined`
- Two separate comment threads: per-process notes (inside each `Procesos[]` entry) and
  `ComentariosCliente[]` on the solicitud itself. `Coordinador.Comentarios[]` now only holds
  the closing comment (`EsCierre: true`), plus whatever legacy entries a record already had

## Key gotchas
- OT field must be exactly 8 characters — enforced client-side only
- The `AUTORIZADOS` email array determines coordinator access. Must match SharePoint user email case-insensitively
- SharePoint REST uses `MERGE` method via `X-HTTP-Method` header for updates (not PUT), and requires `IF-MATCH: *`
- Comments and discards are append-only by design: `updateCoordinatorData` rebuilds history
  from what is already persisted, so the form can only add, never rewrite. Keep it that way
- `appendClientComment` re-reads the item before writing — two people can have the same
  detail open and neither may clobber the other
- Required inputs must never be rendered inside a collapsed panel: the browser cannot focus a
  hidden invalid control and the form silently refuses to submit. The `"Otro"` free-text
  fields stay inline in their row for this reason
- `jspdf` is imported dynamically in `FormatoImpreso.jsx` so it ships as its own chunk
  (~400 KB) instead of loading for everyone. Keep the dynamic `import()`

## Hosting
- `mmhh-react/dist/` is static: `index.html` plus `assets/`, referenced with relative `./assets/` paths. It works on any static host, including SharePoint, as long as the whole folder travels together
- `index.aspx` (the legacy version) needs IIS with ASP.NET; it will not work as a static file
