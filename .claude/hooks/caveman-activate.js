#!/usr/bin/env node
// caveman — SessionStart hook
// Reads active mode and emits caveman ruleset to prime the session

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDefaultMode } = require('./caveman-config');

const flagPath = path.join(os.homedir(), '.claude', '.caveman-active');
const skillPath = path.join(os.homedir(), '.claude', 'skills', 'caveman', 'SKILL.md');
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');

const INDEPENDENT_MODES = ['commit', 'review', 'compress'];

const FALLBACK_RULES = `Caveman mode ACTIVE (full).
Drop: articles, filler (just/really/basically/actually), pleasantries, hedging.
Keep: fragments, short synonyms, exact technical terms, code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Persist until "stop caveman" or "normal mode".`;

function getActiveMode() {
  try {
    if (fs.existsSync(flagPath)) {
      return fs.readFileSync(flagPath, 'utf8').trim();
    }
  } catch (e) {}
  return getDefaultMode();
}

function readSkillContent(mode) {
  try {
    if (!fs.existsSync(skillPath)) return null;
    return fs.readFileSync(skillPath, 'utf8');
  } catch (e) {
    return null;
  }
}

function checkStatuslineConfigured() {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return !!(settings.statusLine);
  } catch (e) {
    return true; // Don't nudge if can't read
  }
}

const mode = getActiveMode();

// Off mode: clean up and exit silently
if (mode === 'off') {
  try { fs.unlinkSync(flagPath); } catch (e) {}
  process.exit(0);
}

// Write flag file
try {
  fs.mkdirSync(path.dirname(flagPath), { recursive: true });
  fs.writeFileSync(flagPath, mode === 'wenyan' ? 'wenyan-full' : mode);
} catch (e) {}

// Independent modes: short activation only
if (INDEPENDENT_MODES.includes(mode)) {
  process.stdout.write(`Caveman ${mode} mode active.\n`);
  process.exit(0);
}

// Read SKILL.md and emit rules
const skillContent = readSkillContent(mode);

if (skillContent) {
  // Strip YAML frontmatter
  const stripped = skillContent.replace(/^---[\s\S]*?---\n/, '');
  process.stdout.write(`[caveman:${mode}]\n${stripped.trim()}\n`);
} else {
  // Fallback ruleset
  process.stdout.write(FALLBACK_RULES + '\n');
}

// Nudge statusline setup if not configured
if (!checkStatuslineConfigured()) {
  process.stdout.write(`\n[caveman] Add to ~/.claude/settings.json for mode badge:\n"statusLine": "cat ~/.claude/.caveman-active 2>/dev/null | tr -d '\\n' | sed 's/.*/[🪨 &]/; t; d'"\n`);
}
