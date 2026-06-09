# AGENTS.md

## Architecture
- Single-file SPA: `index.aspx` — an ASP.NET Web Forms page containing a full React 18 app
- No build step, no package.json, no node_modules. JSX transpiled in-browser via Babel standalone
- Data layer: SharePoint REST API (`_api/web/lists/getbytitle('MMHH_DB')/items`)
- Auth: auto-detects SharePoint user via `_api/web/currentuser`; falls back to hardcoded dev mode when running outside SharePoint
- Images stored as base64 strings inside the SharePoint list's `Data` JSON field — large images may exceed SharePoint's field size limit
- No tests, no CI, no linting/formatting config

## Key gotchas
- When editing JSX, Babel standalone requires `type="text/babel"` on the script tag (already set). Add new component code inside that same script block
- OT field must be exactly 8 characters — enforced client-side only
- The `AUTORIZADOS` email array determines coordinator access. Must match SharePoint user email case-insensitively
- SharePoint REST uses `MERGE` method via `X-HTTP-Method` header for updates (not PUT), and requires `IF-MATCH: *`

## Hosting
- The `.aspx` extension means this must be served by IIS with ASP.NET (.NET Framework). It will not work as a static file on generic HTTP servers
