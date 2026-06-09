# Audio Overview Generator — ELIMFILTERS Knowledge System

## Setup

```bash
# 1. Python deps
pip install notebooklm-py playwright boto3 anthropic

# 2. Playwright browser
playwright install chromium

# 3. NotebookLM auth (run once)
python -c "from notebooklm import NotebookLM; NotebookLM().authenticate()"
# Follow the browser login flow with your Google account

# 4. Environment variables
export ANTHROPIC_API_KEY=sk-ant-...
export R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
export R2_ACCESS_KEY=...
export R2_SECRET_KEY=...
export R2_BUCKET=elimfilters-audio
```

## Generate Audio

```bash
# Single page, both languages
python generate_audio_overviews.py --page lube-oil-systems

# All pages, English only
python generate_audio_overviews.py --all --lang en

# All pages, both languages (~30 MP3 files)
python generate_audio_overviews.py --all
```

## Cloudflare R2 Bucket Setup

1. Go to Cloudflare Dashboard → R2
2. Create bucket: `elimfilters-audio`
3. Set custom domain: `pub-audio.elimfilters.com` → bucket
4. Make bucket public (read)
5. Create API token with R2 write permissions
6. Set env vars R2_ACCESS_KEY, R2_SECRET_KEY, R2_ENDPOINT

## File naming convention

`{page-slug}-{lang}.mp3`

Examples:
- `lube-oil-systems-en.mp3`
- `lube-oil-systems-es.mp3`
- `hydraulic-systems-en.mp3`

## Adding audio player to a page

```tsx
import { AudioOverview } from '@/components/AudioOverview';

// In your page component, after the hero section:
<AudioOverview pageSlug="lube-oil-systems" title="Lube Oil Filtration Systems" />
```

The component:
- Checks if the MP3 exists (HEAD request) — hides itself if not found
- Auto-detects browser language (ES for Spanish/Portuguese, EN for everything else)
- Shows a language toggle button
- Shows progress bar with seek
