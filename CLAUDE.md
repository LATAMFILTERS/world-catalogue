# world-catalogue — Claude Code Config

## Caveman Mode

Token-efficient communication via caveman mode. Reduces output tokens ~75%.

### Usage

- `/caveman` — activate full mode (default)
- `/caveman lite` — less aggressive, keeps articles
- `/caveman ultra` — maximum compression, abbreviations
- `stop caveman` / `normal mode` — deactivate

### Install hooks (one-time per machine)

```bash
# Copy hooks to ~/.claude/hooks/
cp .claude/hooks/*.js ~/.claude/hooks/

# Copy skill
mkdir -p ~/.claude/skills/caveman
cp .claude/skills/caveman/SKILL.md ~/.claude/skills/caveman/

# Add to ~/.claude/settings.json:
# "SessionStart" hook: node ~/.claude/hooks/caveman-activate.js
# "UserPromptSubmit" hook: node ~/.claude/hooks/caveman-mode-tracker.js
```

### Hook files

| File | Purpose |
|------|---------|
| `.claude/hooks/caveman-config.js` | Config resolver (env → file → default) |
| `.claude/hooks/caveman-activate.js` | SessionStart: loads rules each session |
| `.claude/hooks/caveman-mode-tracker.js` | UserPromptSubmit: tracks mode switches |
| `.claude/skills/caveman/SKILL.md` | Skill definition and intensity levels |
