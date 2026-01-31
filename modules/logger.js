const fs = require('fs');
const path = require('path');

class Logger {
  constructor(name) {
    this.name = name;
    this.logFile = path.join('logs', `${name}.log`);
    this.startTime = Date.now();
    this.progressFile = path.join('checkpoints', 'progress.json');
    
    // Limpiar log anterior si existe
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }
  }
  
  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const logLine = `[${timestamp}] [${elapsed}s] [${type}] ${message}`;
    
    // Escribir a archivo
    fs.appendFileSync(this.logFile, logLine + '\n');
    
    // Mostrar en consola con colores
    if (type === 'ERROR') {
      console.error('\x1b[31m%s\x1b[0m', logLine);
    } else if (type === 'SUCCESS') {
      console.log('\x1b[32m%s\x1b[0m', logLine);
    } else if (type === 'WARN') {
      console.log('\x1b[33m%s\x1b[0m', logLine);
    } else {
      console.log(logLine);
    }
  }
  
  info(message) { this.log(message, 'INFO'); }
  success(message) { this.log(message, 'SUCCESS'); }
  warn(message) { this.log(message, 'WARN'); }
  error(message) { this.log(message, 'ERROR'); }
  
  saveCheckpoint(phase, data = {}) {
    const checkpoint = {
      phase,
      timestamp: new Date().toISOString(),
      elapsed_seconds: (Date.now() - this.startTime) / 1000,
      data
    };
    
    const checkpointFile = path.join('checkpoints', `${phase}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
    
    this.success(`💾 Checkpoint guardado: ${phase}`);
  }
  
  loadCheckpoint(phase) {
    const checkpointFile = path.join('checkpoints', `${phase}.json`);
    if (fs.existsSync(checkpointFile)) {
      return JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    }
    return null;
  }
  
  updateProgress(phase, current, total, details = '') {
    const progress = {
      phase,
      current,
      total,
      percentage: total > 0 ? ((current / total) * 100).toFixed(2) : 0,
      details,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
  }
}

module.exports = Logger;
