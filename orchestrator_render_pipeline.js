require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const MONGO_URI = process.env.MONGODB_URI;
const SPIN_ON_URL = "http://localhost:3001/spin_on";
const LABEL_URL = "http://localhost:3002/label";
const QC_URL = "http://localhost:3003/qc";
async function connectDB() {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo conectado");
}
async function getFilter(sku) {
    const db = mongoose.connection.db;
    return db.collection("unified_filters").findOne({
        elimfiltersSKU: sku
    });
}
function buildSpinOnInput(doc) {

    const heightMm = doc.height_mm_numeric || 150;
    const diameterMm = doc.outer_diameter_mm_numeric || 90;

    const gasketOd = doc.gasket_od_mm_numeric || 0;
    const gasketId = doc.gasket_id_mm_numeric || 0;

    const threadStandard = doc.thread_geometry?.standard || "UN";
    const threadSize = doc.thread_geometry?.thread_size || "";
    const tpi = doc.thread_geometry?.tpi || null;
    const pitchMm = doc.thread_geometry?.pitch_mm || null;

    return {
        sku: doc.elimfiltersSKU,

        geometry_master: {
            height_mm: heightMm,
            outer_diameter_mm: diameterMm
        },

        thread_geometry: {
            standard: threadStandard,
            thread_size: threadSize,
            tpi: tpi,
            pitch_mm: pitchMm
        },

        gasket_od_mm_numeric: gasketOd,
        gasket_id_mm_numeric: gasketId
    };
}
async function runPipeline(sku) {
    const doc = await getFilter(sku);
    if (!doc) {
        console.log("SKU no encontrado en MongoDB:", sku);
        return;
    }
    console.log("Documento encontrado:", doc.elimfiltersSKU, "| Tecnología:", doc.elimfiltersTechnology);
    const spinInput = buildSpinOnInput(doc);
    console.log("SPIN INPUT:", spinInput);
    const spin = await axios.post(SPIN_ON_URL, spinInput);
    console.log("Spin OK");
    const label = await axios.post(LABEL_URL, spin.data);
    console.log("Label OK");
    const qc = await axios.post(QC_URL, label.data);
    console.log("QC OK");
    console.log("RESULTADO FINAL:");
    console.log(qc.data);
}
async function main() {
    const sku = process.argv[2];
    if (!sku) {
        console.log("Uso: node orchestrator_render_pipeline.js EL82100");
        return;
    }
    await connectDB();
    await runPipeline(sku);
}
main();
