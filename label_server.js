require('dotenv').config();
const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());

const RENDERS_DIR = path.join(__dirname, 'renders');
const STAGES_DIR = path.join(__dirname, 'renders', 'stages');
const LOGO_PATH = path.join(__dirname, 'assets', 'logo-elimfilters.png');
if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR);
if (!fs.existsSync(STAGES_DIR)) fs.mkdirSync(STAGES_DIR);
app.use('/renders', express.static(RENDERS_DIR));

async function skill_inpainting(refImagePath, sku) {
    console.log('[SKILL 1] interpolacion de litografia...');
    const stagePath = path.join(STAGES_DIR, sku + '_s1_clean.png');
    const { data, info } = await sharp(refImagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = new Uint8Array(data);

    // Recuadro exacto de la litografia Fleetguard
    const zoneLeft  = Math.round(info.width * 0.47);
    const zoneTop   = Math.round(info.height * 0.20);
    const zoneRight = Math.round(info.width * 0.80);
    const zoneBot   = Math.round(info.height * 0.55);

    for (let y = zoneTop; y <= zoneBot; y++) {
        // Tomar el color del borde izquierdo y derecho FUERA del recuadro (2px afuera)
        const iLeft  = (y * info.width + (zoneLeft - 2)) * 4;
        const iRight = (y * info.width + (zoneRight + 2)) * 4;
        const rL = px[iLeft],  gL = px[iLeft+1],  bL = px[iLeft+2];
        const rR = px[iRight], gR = px[iRight+1], bR = px[iRight+2];
        for (let x = zoneLeft; x <= zoneRight; x++) {
            const i = (y * info.width + x) * 4;
            // Interpolar horizontalmente preservando gradiente del cilindro
            const t = (x - zoneLeft) / (zoneRight - zoneLeft);
            px[i]   = Math.round(rL + (rR - rL) * t);
            px[i+1] = Math.round(gL + (gR - gL) * t);
            px[i+2] = Math.round(bL + (bR - bL) * t);
        }
    }

    await sharp(Buffer.from(px), { raw: { width: info.width, height: info.height, channels: 4 } })
        .png().toFile(stagePath);
    console.log('[SKILL 1] OK ->', stagePath);
    return stagePath;
}

async function skill_recolor_k90(cleanPath, sku) {
    console.log('[SKILL 2] recolor K:90...');
    const stagePath = path.join(STAGES_DIR, sku + '_s2_black.png');
    const { data, info } = await sharp(cleanPath).raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8Array(data);
    const out = Buffer.alloc(pixels.length);
    for (let i = 0; i < pixels.length; i += info.channels) {
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const a = info.channels === 4 ? pixels[i+3] : 255;
        if (r > 240 && g > 240 && b > 240) { out[i]=r; out[i+1]=g; out[i+2]=b; }
        else if (r < 50 && g < 50 && b < 50) { out[i]=r; out[i+1]=g; out[i+2]=b; }
        else if (Math.abs(r-g) < 15 && Math.abs(g-b) < 15 && r > 80 && r < 180) { out[i]=r; out[i+1]=g; out[i+2]=b; }
        else { out[i]=26; out[i+1]=26; out[i+2]=26; }
        if (info.channels === 4) out[i+3] = a;
    }
    await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toFile(stagePath);
    console.log('[SKILL 2] OK ->', stagePath);
    return stagePath;
}

async function skill_litografia_injector(blackPath, sku, thread) {
    console.log('[SKILL 3] litografia_injector...');
    const finalPath = path.join(RENDERS_DIR, sku + '.png');
    const { width, height } = await sharp(blackPath).metadata();
    const logoWidth = Math.round(width * 0.28);
    const logoLeft  = Math.round(width * 0.52);
    const logoTop   = Math.round(height * 0.30);
    const logoResized = await sharp(LOGO_PATH).resize(logoWidth, null, { fit: 'inside' }).png().toBuffer();
    const logoMeta   = await sharp(logoResized).metadata();
    const skuSize    = Math.round(height * 0.058);
    const threadSize = Math.round(height * 0.026);
    const skuLeft    = logoLeft;
    const skuTop     = logoTop + logoMeta.height + Math.round(height * 0.045);
    const threadTop  = skuTop + skuSize + Math.round(height * 0.022);
    const textSvg = Buffer.from(
        '<svg width="' + width + '" height="' + height + '">' +
        '<text x="' + skuLeft + '" y="' + skuTop + '" font-family="Arial, sans-serif" font-size="' + skuSize + '" font-weight="bold" fill="#999999">' + sku + '</text>' +
        '<text x="' + skuLeft + '" y="' + threadTop + '" font-family="Arial, sans-serif" font-size="' + threadSize + '" fill="#999999">' + thread + '</text>' +
        '</svg>'
    );
    await sharp(blackPath).composite([{ input: logoResized, left: logoLeft, top: logoTop }, { input: textSvg, top: 0, left: 0 }]).png().toFile(finalPath);
    console.log('[SKILL 3] OK ->', finalPath);
    return finalPath;
}

app.post('/label', async (req, res) => {
    const data = req.body;
    if (data.status !== 'OK') return res.json({ agent: 'label_engine', status: 'ERROR' });
    const sku = data.sku;
    const refImagePath = data.reference_image_path || null;
    const thread = data.thread_geometry && data.thread_geometry.designation || '';
    if (!refImagePath || !fs.existsSync(refImagePath)) {
        return res.json({ agent: 'label_engine', status: 'ERROR', error: 'reference_image_path requerida' });
    }
    try {
        const s1    = await skill_inpainting(refImagePath, sku);
        const s2    = await skill_recolor_k90(s1, sku);
        const final = await skill_litografia_injector(s2, sku, thread);
        return res.json({ agent: 'label_engine', status: 'OK', image_url: 'http://localhost:3002/renders/' + sku + '.png', image_path: final, stages: { s1, s2 }, sku, geometry_master: data.geometry_master, thread_geometry: data.thread_geometry });
    } catch (err) {
        console.error('Error:', err.message);
        return res.json({ agent: 'label_engine', status: 'ERROR', error: err.message });
    }
});

app.listen(3002, () => console.log('Label Engine v15 - interpolacion - running on port 3002'));

