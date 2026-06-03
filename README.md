# perform6-admin

Perform6 **SaaS admin portal** for gym operators — content, devices, schedules.

Deploy target: **Cloudflare Pages** or static files on VPS behind `admin.perform6.com`.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5174

## Related repos

- [perform6-api](../perform6-api) — OpenAPI: `docs/openapi.yaml`
- [perform6-touchscreen](../perform6-touchscreen) — Player app

## API contract

Generate clients from [perform6-api/docs/openapi.yaml](../perform6-api/docs/openapi.yaml) when endpoints are implemented (Milestone 3).
