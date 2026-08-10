# coastnow.in

Static marketing site and legal pages for [Coast](https://coastnow.in) — a
ride-matching app for India.

Deployed to GitHub Pages from `master`. No build step; these are plain files.

- `privacy-policy.html` — linked from the Play Store listing
- `delete-account.html` — the account-deletion URL Play requires
- `terms-of-service.html`

`js/config.js` holds the Supabase project URL and **anon** key. Both are
publishable by design — the same values ship inside every app build, and row
level security is what protects the data. Do not put a service-role key here.

Local preview:

```bash
node serve.js   # http://localhost:3000
```
