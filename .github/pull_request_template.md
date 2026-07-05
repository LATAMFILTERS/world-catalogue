## Summary

Describe what changed and why.

## Safety checklist

- [ ] This PR does not include generated static export files under `frontend/out/**`.
- [ ] This PR does not include generated citation API files under `frontend/public/api/citation/**` unless this is a dedicated automation/generated-output PR.
- [ ] This PR does not include unresolved Git conflict markers.
- [ ] `npm run build` passes locally or in CI.
- [ ] Any new Knowledge Center entity has unique slug/canonical metadata.
- [ ] Any new routes have matching sitemap/SEO expectations.

## Notes

Generated outputs should be produced by the build/deploy pipeline. Avoid mixing source changes and generated artifacts in the same PR.
