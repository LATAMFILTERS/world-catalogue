const mongoose = require('mongoose');

let connection = null;
let mongoClient = null;

/**
 * Configuración de MongoDB
 * Soporta tanto Mongoose como MongoDB native client
 */

const mongoUri = process.env.MONGODB_URI ||
  'mongodb+srv://elimfilters_db_admin:Elim2026@cluster0.dll4jew.mongodb.net/ELIMFILTERS_DB?appName=Cluster0&retryWrites=true&w=majority';

async function init() {
  if (connection) return connection;

  try {
    console.log('📊 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado vía Mongoose');
    connection = mongoose.connection;
    return connection;
  } catch (err) {
    console.error('❌ Error conectando MongoDB:', err.message);
    throw err;
  }
}

function get() {
  // Retorna la base de datos de Mongoose para operaciones con collections nativas
  if (!mongoose.connection.db) {
    throw new Error('MongoDB no está conectado. Llama a init() primero.');
  }
  return mongoose.connection.db;
}

async function close() {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
    console.log('🔌 MongoDB desconectado');
  }
}

// Inicializar automáticamente si se requiere el módulo
if (require.main === module) {
  init().then(() => {
    console.log('✅ Conexión de prueba exitosa');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  init,
  get,
  close,
  mongoUri,
};
