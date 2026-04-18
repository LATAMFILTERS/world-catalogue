#!/usr/bin/env node
// caveman — shared config resolver
// Priority: env var → config file → built-in default ('full')

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_MODES = [
  'off', 'lite', 'full', 'ultra',
  'wenyan-lite', 'wenyan-full', 'wenyan-ultra',
  'commit', 'review', 'compress'
];

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'caveman');
  }
  if (process.platform === 'win32' && process.env.APPDATA) {
    return path.join(process.env.APPDATA, 'caveman');
  }
  return path.join(os.homedir(), '.config', 'caveman');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function getDefaultMode() {
  // 1. Environment variable
  const envMode = process.env.CAVEMAN_DEFAULT_MODE;
  if (envMode && VALID_MODES.includes(envMode)) {
    return envMode;
  }

  // 2. Config file
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.defaultMode && VALID_MODES.includes(config.defaultMode)) {
        return config.defaultMode;
      }
    }
  } catch (e) {
    // Silent fail
  }

  // 3. Built-in default
  return 'full';
}

module.exports = { getDefaultMode, getConfigDir, getConfigPath, VALID_MODES };
