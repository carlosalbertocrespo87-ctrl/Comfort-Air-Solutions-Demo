# Public demo verification evidence

The canonical public-demo verification workflow is `.github/workflows/verify-all-public-demo-routes.yml`.

It checks configured live demo routes for reachability, a document title, `noindex`, and per-route `robots.txt` containing `Disallow: /`.

The workflow emits `qa-artifacts/public-demo-verification.json` and retains it as a GitHub Actions artifact for 30 days. The report includes repository/run metadata, route-level PASS/FAIL results, and an overall status.

This file is operational documentation only and is not customer-facing content.
