const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const classifyDuty = async (code) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Eres un ingeniero experto en filtración industrial y automotriz.

Clasifica el código de filtro como HD o LD basándote ÚNICAMENTE en:

1. ESPECIFICACIONES TÉCNICAS:
   - Tamaño del filtro (grande = HD, pequeño = LD)
   - Capacidad de flujo (alto = HD, bajo = LD)
   - Presión de operación (alta = HD, baja = LD)

2. APLICACIONES TÍPICAS DEL CÓDIGO:
   HD: Tractores John Deere, Caterpillar, Volvo, Mack, Cummins, Detroit Diesel, equipos de construcción, minería, agricultura pesada, camiones comerciales, generadores industriales, equipos marinos
   
   LD: Ford, GM, Chrysler, Honda, Toyota, Nissan, automóviles particulares, SUVs pequeños, pickups ligeras, motores de gasolina

3. FABRICANTE DEL MOTOR/EQUIPO:
   HD: Cummins, CAT, John Deere, Volvo Penta, Detroit, Perkins, Yanmar (diesel), Deutz
   
   LD: Ford EcoBoost, GM 3.6L, Toyota 2.5L, Honda 2.0T, motores de gasolina en general

❌ NO uses el prefijo del código para clasificar
✅ USA las especificaciones técnicas y aplicaciones

Responde SOLO: HD o LD`
                },
                {
                    role: "user",
                    content: `Analiza este código de filtro considerando sus especificaciones técnicas típicas y aplicaciones: ${code}

¿Para qué tipo de motores y equipos se usa típicamente este código?
¿Qué capacidades y especificaciones tiene?

Clasificación:`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 100
        });
        
        const response = chatCompletion.choices[0].message.content.trim();
        console.log(`🤖 GROQ análisis: ${response}`);
        
        // Extraer HD o LD de la respuesta
        const result = response.toUpperCase();
        const duty = result.includes('HD') ? 'HD' : 'LD';
        
        console.log(`✅ DUTY clasificado: ${duty}`);
        return duty;
        
    } catch (error) {
        console.error("❌ Error en Clasificación GROQ:", error.message);
        
        // Fallback: Análisis básico del código
        const code_upper = code.toUpperCase();
        
        // Códigos que típicamente son HD por su uso conocido
        const KNOWN_HD_PATTERNS = [
            /^P\d{6}$/,      // Donaldson heavy duty típico
            /^LF\d{4,}/,     // Fleetguard lube (mayormente HD)
            /^RE\d{5}/,      // John Deere OEM
            /^AR\d{5}/,      // Case IH / CNH
            /^CAT/,          // Caterpillar
        ];
        
        for (const pattern of KNOWN_HD_PATTERNS) {
            if (pattern.test(code_upper)) {
                console.log(`⚠️ Fallback: Patrón conocido HD`);
                return 'HD';
            }
        }
        
        // Si no coincide con patrones conocidos, por defecto HD
        // (mejor clasificar como HD y que el usuario corrija)
        console.log(`⚠️ Fallback: Default HD`);
        return 'HD';
    }
};

module.exports = { classifyDuty };
