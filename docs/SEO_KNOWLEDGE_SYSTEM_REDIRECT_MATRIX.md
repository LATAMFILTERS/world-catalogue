# SEO Knowledge-System Redirect Matrix

Audit basis: `seo-geo-audit-9` (production HTTP crawl).

| Layer | Observed behavior | Root cause | Corrective action | Expected verification |
|---|---|---|---|---|
| Next.js App Router | Legacy pages originally returned `200` with a canonical pointing elsewhere, then `200 noindex` | Static-exported legacy routes were still real HTML documents | Remove the legacy route pages from `frontend/src/app` | No exported `knowledge-system/**/index.html` pages |
| Static export | After page removal, the 19 legacy URLs returned `404` | `output: 'export'` cannot execute Next.js runtime redirects | Keep legacy pages absent and move redirects to the hosting layer | Legacy routes must not resolve as static files |
| `_redirects` file | Rules existed but production still returned `404` | The active Render static host does not consume Cloudflare Pages `_redirects` semantics | Define redirects in the Render static service `routes` configuration | HTTP response is 301/302 with a `Location` header |
| Render static frontend | No frontend service or route rules were declared in the repository blueprint | Hosting behavior was outside the repository's deploy contract | Add `elimfilters-frontend` with `runtime: static`, `rootDir: frontend`, `staticPublishPath: ./out`, and exact redirect rules | Render deploy recognizes the frontend and applies rules before file lookup |
| SEO audit | 19 HIGH errors, all `404` under `/knowledge-system` | Redirect layer was missing | Map each audited route to its canonical Knowledge Center destination | `status` is 200 after following redirects, `redirect_hops >= 1`, and no HIGH finding |

## Audited production routes covered

- `/knowledge-system`
- `/knowledge-system/contamination`
- `/knowledge-system/contamination/particle-wear`
- `/knowledge-system/contamination/diesel-water`
- `/knowledge-system/contamination/hydraulic-system`
- `/knowledge-system/standards`
- `/knowledge-system/standards/iso-16889`
- `/knowledge-system/standards/iso-4406`
- `/knowledge-system/standards/astm-d6304`
- `/knowledge-system/standards/iso-12937`
- `/knowledge-system/standards/iso-5011`
- `/knowledge-system/standards/din-51524`
- `/knowledge-system/standards/iso-16332`
- `/knowledge-system/standards/nfpa-t2-14`
- `/knowledge-system/standards/astm-d6210`
- `/knowledge-system/standards/eu-dir-2019-130`
- `/knowledge-system/standards/iso-11155`
- `/knowledge-system/standards/iso-8573-1`
- `/knowledge-system/standards/sae-j1539`

The legacy `/knowledge-center/engineering/operator-health` route is also redirected to `/knowledge-center/systems/cabin-air-protection/` at the same infrastructure layer.
