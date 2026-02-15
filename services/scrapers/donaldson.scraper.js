const axios = require("axios");
const cheerio = require("cheerio");
const getDonaldsonAlternatives = require("./getDonaldsonAlternatives");

/**
 * Donaldson Scraper v2 - Con búsqueda automática
 * Encuentra el producto mediante búsqueda y extrae toda la información
 */
module.exports = async function donaldsonScraper(code) {
    try {
        console.log(`🔍 Buscando código Donaldson: ${code}`);
        
        // PASO 1: Buscar el producto para obtener su URL completa
        const productUrl = await findProductUrl(code);
        
        if (!productUrl) {
            console.log(`❌ Producto ${code} no encontrado en Donaldson`);
            return {
                error: true,
                message: `Producto ${code} no encontrado en el catálogo de Donaldson`,
                skuBuscado: code
            };
        }
        
        console.log(`✅ URL encontrada: ${productUrl}`);
        
        // PASO 2: Obtener el HTML de la página del producto
        const { data: html } = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        
        const $ = cheerio.load(html);
        
        // PASO 3: Extraer información básica
        const descripcion = $(".product-name, h1.product-title").first().text().trim() ||
                           $("h1").first().text().trim();
        
        const codigo = $(".product-code, .part-number").first().text().trim() || code;
        
        // PASO 4: Extraer imagen principal
        const imagen = $("img.product-image, .product-detail-image img").first().attr("src") ||
                      $("meta[property='og:image']").attr("content") ||
                      "";
        
        // PASO 5: Extraer especificaciones técnicas
        const especificaciones = extractSpecifications($);
        
        // PASO 6: Extraer cross references (referencias cruzadas)
        const crossReferences = extractCrossReferences($);
        
        // PASO 7: Extraer dimensiones
        const dimensiones = extractDimensions($);
        
        // PASO 8: Extraer categoría
        const categoria = extractCategory($);
        
        // PASO 9: Obtener productos alternativos con Puppeteer (si existe)
        let productosAlternativos = [];
        try {
            if (getDonaldsonAlternatives) {
                productosAlternativos = await getDonaldsonAlternatives(productUrl);
            }
        } catch (err) {
            console.log("⚠️  No se pudieron obtener productos alternativos:", err.message);
        }
        
        // PASO 10: Construir respuesta final
        return {
            success: true,
            brand: "Donaldson",
            skuBuscado: code,
            idReal: codigo,
            descripcion,
            imagen: imagen.startsWith('http') ? imagen : `https://shop.donaldson.com${imagen}`,
            categoria,
            especificaciones,
            dimensiones,
            crossReferences,
            productosAlternativos,
            urlFinal: productUrl,
            
            // Estadísticas
            stats: {
                cantidadEspecificaciones: Object.keys(especificaciones).length,
                cantidadCrossReferences: crossReferences.length,
                cantidadAlternativos: productosAlternativos.length
            },
            
            timestamp: new Date().toISOString(),
            version: "v2.0_search_based"
        };
        
    } catch (error) {
        console.error("🔴 ERROR EN DONALDSON SCRAPER:", error.message);
        return {
            error: true,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            skuBuscado: code
        };
    }
};

/**
 * Busca el producto en Donaldson y retorna su URL completa
 */
async function findProductUrl(code) {
    const searchUrl = `https://shop.donaldson.com/store/en-us/home?Ntt=${code}`;
    
    try {
        const { data: html } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });
        
        const $ = cheerio.load(html);
        
        // Buscar el primer link que contenga "/product/"
        let productPath = null;
        
        // Intentar varios selectores
        const selectors = [
            'a[href*="/product/"]',
            '.product-link',
            '.product-item a',
            'a.part-number-link'
        ];
        
        for (const selector of selectors) {
            const link = $(selector).first().attr('href');
            if (link && link.includes('/product/')) {
                productPath = link;
                break;
            }
        }
        
        // Si no encontramos con selectores, buscar en todo el HTML
        if (!productPath) {
            const regex = /\/store\/[a-z]{2}-[a-z]{2}\/product\/[A-Z0-9]+\/\d+/;
            const match = html.match(regex);
            if (match) {
                productPath = match[0];
            }
        }
        
        if (!productPath) {
            return null;
        }
        
        // Construir URL completa
        return productPath.startsWith('http') 
            ? productPath 
            : `https://shop.donaldson.com${productPath}`;
            
    } catch (error) {
        console.error("Error en búsqueda:", error.message);
        return null;
    }
}

/**
 * Extrae especificaciones técnicas
 */
function extractSpecifications($) {
    const specs = {};
    
    // Intentar varios formatos de tablas
    $('.spec-table tr, .specifications tr, table.product-specs tr').each((i, el) => {
        const cells = $(el).find('td');
        if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();
            if (label && value) {
                specs[label] = value;
            }
        }
    });
    
    // También buscar en listas de definición
    $('dl.specifications dt').each((i, el) => {
        const label = $(el).text().trim();
        const value = $(el).next('dd').text().trim();
        if (label && value) {
            specs[label] = value;
        }
    });
    
    return specs;
}

/**
 * Extrae referencias cruzadas
 */
function extractCrossReferences($) {
    const crossRefs = [];
    
    // Buscar en la tabla de cross references
    $('#crossReferencesList tr, .cross-reference-table tr').each((i, el) => {
        const manufacturer = $(el).find('td').eq(0).text().trim();
        const partNumber = $(el).find('td').eq(1).text().trim();
        const notes = $(el).find('td').eq(2).text().trim();
        
        if (manufacturer && partNumber) {
            crossRefs.push({
                manufacturer,
                partNumber,
                notes: notes || ""
            });
        }
    });
    
    // También buscar números sueltos
    $('.cross-reference-number').each((i, el) => {
        const value = $(el).text().trim();
        if (value && !crossRefs.find(ref => ref.partNumber === value)) {
            crossRefs.push({
                manufacturer: "Unknown",
                partNumber: value,
                notes: ""
            });
        }
    });
    
    return crossRefs;
}

/**
 * Extrae dimensiones del paquete
 */
function extractDimensions($) {
    const dimensions = {};
    
    $('.package-dimensions tr, #packageDimensions tr').each((i, el) => {
        const label = $(el).find('td').eq(0).text().trim();
        const value = $(el).find('td').eq(1).text().trim();
        if (label && value) {
            dimensions[label] = value;
        }
    });
    
    return dimensions;
}

/**
 * Extrae la categoría del producto
 */
function extractCategory($) {
    const breadcrumbs = [];
    
    $('.breadcrumb a, nav.breadcrumb a, .breadcrumbs a').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text !== 'Home' && text !== 'Accueil') {
            breadcrumbs.push(text);
        }
    });
    
    return breadcrumbs.join(' > ');
}
