require('dotenv').config();
const express = require('express');
const {Client} = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();
app.set('trust proxy', 1);

// Healthcheck FIRST — must respond before anything else can fail
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '3.8.0' }));

// TEMP: inspect raw dimensions for a SKU — DELETE AFTER USE
app.get('/api/admin/dims/:sku', async (req, res) => {
  if (req.query.key !== 'elim2026admin') return res.status(403).json({ error: 'forbidden' });
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const r = await client.query(
      `SELECT sku, filter_type, sub_type, installation_type,
              height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
              thread_size, micron_rating, nominal_efficiency,
              burst_pressure_psi, collapse_pressure_psi, iso_test_method
       FROM elimfilters_catalog WHERE UPPER(sku) = UPPER($1)`,
      [req.params.sku]
    );
    if (!r.rows.length) return res.json({ error: 'not found' });
    const d = r.rows[0];
    const toIn = v => v ? +(v / 25.4).toFixed(3) : null;
    res.json({
      sku: d.sku,
      filter_type: d.filter_type,
      sub_type: d.sub_type,
      installation_type: d.installation_type,
      height:      { mm: d.height_mm,           in: toIn(d.height_mm) },
      od:          { mm: d.outer_diameter_mm,    in: toIn(d.outer_diameter_mm) },
      gasket_od:   { mm: d.gasket_od_mm,         in: toIn(d.gasket_od_mm) },
      gasket_id:   { mm: d.gasket_id_mm,         in: toIn(d.gasket_id_mm) },
      thread:      d.thread_size,
      micron:      d.micron_rating,
      efficiency:  d.nominal_efficiency,
      burst_psi:   d.burst_pressure_psi,
      collapse_psi: d.collapse_pressure_psi,
      iso_method:  d.iso_test_method,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { await client.end(); }
});

// TEMP: fix dimensions from CSV — DELETE AFTER USE
app.get('/api/admin/fix-dimensions', async (req, res) => {
  if (req.query.key !== 'elim2026admin') return res.status(403).json({ error: 'forbidden' });
  const csvPath = path.join(__dirname, 'data', 'dims.csv');
  if (!fs.existsSync(csvPath)) return res.status(404).json({ error: 'dims.csv not found' });

  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);
  const headers = lines[0].split(',');
  const idx = k => headers.indexOf(k);

  const rows = lines.slice(1).map(l => {
    const cols = l.split(',');
    return {
      sku:  cols[idx('sku')]?.trim(),
      od:   parseFloat(cols[idx('od')]) || null,
      h:    parseFloat(cols[idx('h')]) || null,
      god:  parseFloat(cols[idx('god')]) || null,
      gid:  parseFloat(cols[idx('gid')]) || null,
      thread: cols[idx('thread')]?.trim() || null,
      burst:  parseFloat(cols[idx('burst')]) || null,
      collapse: parseFloat(cols[idx('collapse')]) || null,
      sub:  cols[idx('sub')]?.trim() || null,
      inst: cols[idx('inst')]?.trim() || null,
      ft:   cols[idx('ft')]?.trim() || null,
    };
  }).filter(r => r.sku);

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    let updated = 0, skipped = 0;
    for (const r of rows) {
      const res2 = await client.query(
        `UPDATE elimfilters_catalog
         SET outer_diameter_mm    = COALESCE($2, outer_diameter_mm),
             height_mm            = COALESCE($3, height_mm),
             gasket_od_mm         = COALESCE($4, gasket_od_mm),
             gasket_id_mm         = COALESCE($5, gasket_id_mm),
             thread_size          = COALESCE($6, thread_size),
             burst_pressure_psi   = COALESCE($7, burst_pressure_psi),
             collapse_pressure_psi = COALESCE($8, collapse_pressure_psi),
             installation_type    = COALESCE($9, installation_type),
             filter_type          = COALESCE($10, filter_type)
         WHERE sku = $1`,
        [r.sku, r.od, r.h, r.god, r.gid, r.thread, r.burst, r.collapse, r.inst, r.ft]
      );
      if (res2.rowCount > 0) updated++; else skipped++;
    }
    res.json({ total_csv: rows.length, updated, skipped });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally { await client.end(); }
});

// TEMP: batch-update lube filter descriptions — DELETE AFTER USE
app.get('/api/admin/update-lube-descriptions', async (req, res) => {
  if (req.query.key !== 'elim2026admin') return res.status(403).json({ error: 'forbidden' });
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();

    const DESC = {
      spinon: {
        en: 'ELIMFILTERS® Lube Filter, Spin-On developed for industrial asset protection. Its SYNTRAX™ technology deploys a four-layer contamination control matrix, each layer calibrated to a specific particle size class, intercepting sub-micron particles before they reach critical engine components across the complete service interval.',
        es: 'ELIMFILTERS® Filtro de aceite spin-on desarrollado para la protección de activos industriales. Su tecnología SYNTRAX™ despliega una matriz de control de contaminación de cuatro capas, cada una calibrada para una clase de tamaño de partícula específica, interceptando partículas submicrónónicas antes de que alcancen los componentes críticos del motor durante todo el intervalo de servicio.',
      },
      cartridge: {
        en: 'ELIMFILTERS® Lube Filter, Cartridge developed for industrial asset protection and to minimize environmental impact in industrial operations. Its SYNTRAX™ technology deploys a four-layer contamination control matrix, each layer calibrated to a specific particle size class, intercepting sub-micron particles before they reach critical engine components across the complete service interval.',
        es: 'ELIMFILTERS® Filtro de aceite tipo cartucho desarrollado para la protección de activos industriales y minimizar el impacto ambiental en operaciones industriales. Su tecnología SYNTRAX™ despliega una matriz de control de contaminación de cuatro capas, cada una calibrada para una clase de tamaño de partícula específica, interceptando partículas submicrónicas antes de que alcancen los componentes críticos del motor durante todo el intervalo de servicio.',
      },
      centrifuge: {
        en: 'ELIMFILTERS® Centrifuge Disposable Rotor developed for industrial asset protection. Its SYNTRAX™ technology provides centrifugal oil filtration through a fully disposable drop-in design that eliminates the need for special tools, reducing maintenance time to approximately 20 minutes and enabling faster return-to-service across demanding industrial duty cycles.',
        es: 'ELIMFILTERS® Rotor desechable de centrífuga desarrollado para la protección de activos industriales. Su tecnología SYNTRAX™ proporciona filtración de aceite por centrifugación mediante un diseño desechable tipo drop-in que elimina la necesidad de herramientas especiales, reduciendo el tiempo de mantenimiento a aproximadamente 20 minutos y permitiendo un retorno a operación más rápido en ciclos de trabajo industriales exigentes.',
      },
      cabin: {
        en: 'ELIMFILTERS® Cabin Air Filter developed for occupant health protection in heavy-duty and industrial vehicle cabins. Its MICROKAPPA™ technology combines three capture mechanisms — electrostatic attraction, HEPA-class mechanical filtration and activated carbon adsorption — intercepting PM2.5 particles, allergens, diesel exhaust gases and odors before they reach the cab interior.',
        es: 'ELIMFILTERS® Filtro de aire de cabina desarrollado para la protección de la salud del operador en cabinas de vehículos industriales y de trabajo pesado. Su tecnología MICROKAPPA™ combina tres mecanismos de captura — atracción electrostática, filtración mecánica clase HEPA y adsorción de carbono activado — interceptando partículas PM2.5, alérgenos, gases de escape diésel y olores antes de que lleguen al interior de la cabina.',
      },
      airhousing: {
        en: 'ELIMFILTERS® Air Filter Housing developed for industrial asset protection across heavy-duty air intake systems. Its INTEKCORE™ technology delivers a high-pressure rated housing engineered to maintain structural integrity across the full thermal cycling range of commercial and industrial engines, ensuring the housing never becomes the failure point of the filtration system.',
        es: 'ELIMFILTERS® Carcasa de filtro de aire desarrollada para la protección de activos industriales en sistemas de admisión de aire para trabajo pesado. Su tecnología INTEKCORE™ ofrece una carcasa de alta presión diseñada para mantener la integridad estructural en todo el rango de ciclos térmicos de motores comerciales e industriales, asegurando que la carcasa nunca sea el punto de falla del sistema de filtración.',
      },
      precleaner: {
        en: 'ELIMFILTERS® Air Precleaner developed for industrial asset protection as the first stage of the air intake system. Its INTEKCORE™ technology provides self-cleaning pre-separation of particles denser than air before they reach the primary filtration element, extending air filter service life and reducing maintenance frequency across demanding industrial duty cycles.',
        es: 'ELIMFILTERS® Preclasificador de aire desarrollado para la protección de activos industriales como primera etapa del sistema de admisión de aire. Su tecnología INTEKCORE™ proporciona preseparación autolimpiante de partículas más densas que el aire antes de que lleguen al elemento filtrante primario, extendiendo la vida útil del filtro de aire y reduciendo la frecuencia de mantenimiento en ciclos de trabajo industriales exigentes.',
      },
      air_radial: {
        en: 'ELIMFILTERS® Air Filter, Primary — Radial Seal, developed for industrial asset protection in the most demanding operating environments. Its MACROCORE™ technology deploys a progressive density gradient matrix that intercepts airborne contamination before it reaches the combustion chamber, delivering extended service life across the harshest industrial duty cycles.',
        es: 'ELIMFILTERS® Filtro de aire primario — sello radial, desarrollado para la protección de activos industriales en los entornos operativos más exigentes. Su tecnología MACROCORE™ despliega una matriz de gradiente de densidad progresiva que intercepta la contaminación del aire antes de que llegue a la cámara de combustión, garantizando una vida útil extendida en los ciclos de trabajo industriales más severos.',
      },
      air_axial: {
        en: 'ELIMFILTERS® Air Filter, Primary — Axial Seal, developed for industrial asset protection. Its MACROCORE™ technology delivers a precision axial seal that eliminates contamination bypass, ensuring airborne particles are intercepted before reaching the combustion chamber and preserving engine efficiency across the complete service interval.',
        es: 'ELIMFILTERS® Filtro de aire primario — sello axial, desarrollado para la protección de activos industriales. Su tecnología MACROCORE™ proporciona un sello axial de precisión que elimina el paso de contaminación, asegurando que las partículas en suspensión sean interceptadas antes de llegar a la cámara de combustión y preservando la eficiencia del motor durante todo el intervalo de servicio.',
      },
      air_tetramax: {
        en: 'ELIMFILTERS® Air Filter, Primary developed for industrial asset protection in medium- and heavy-duty applications. Its MACROCORE™ technology delivers a high-density axial flow media pack in a compact form factor, achieving higher contamination control performance across 5 to 15L engine platforms while reducing the physical footprint of the air filtration system.',
        es: 'ELIMFILTERS® Filtro de aire primario desarrollado para la protección de activos industriales en aplicaciones medianas y pesadas. Su tecnología MACROCORE™ ofrece un paquete de medios de flujo axial de alta densidad en formato compacto, logrando un mayor rendimiento en el control de contaminación en plataformas de motores de 5 a 15L, reduciendo la huella física del sistema de filtración.',
      },
      air_powercore: {
        en: 'ELIMFILTERS® Air Filter, Primary developed for industrial asset protection. Its MACROCORE™ technology is engineered to precise media specifications — fiber geometry, pore size, thickness and mechanical strength — delivering consistent contamination control performance that meets or exceeds OEM air filtration system requirements.',
        es: 'ELIMFILTERS® Filtro de aire primario desarrollado para la protección de activos industriales. Su tecnología MACROCORE™ está diseñada con especificaciones precisas de medio filtrante — geometría de fibra, tamaño de poro, espesor y resistencia mecánica — ofreciendo un control de contaminación consistente que cumple o supera los requisitos de los sistemas de filtración de aire OEM.',
      },
      air_secondary: {
        en: 'ELIMFILTERS® Air Filter, Secondary developed for industrial asset protection. Its MACROCORE™ technology provides a precision secondary barrier that intercepts contamination bypass, protecting critical engine components during primary element service and extending maintenance intervals while reducing operational downtime.',
        es: 'ELIMFILTERS® Filtro de aire secundario desarrollado para la protección de activos industriales. Su tecnología MACROCORE™ proporciona una barrera secundaria de precisión que intercepta el paso de contaminación, protegiendo los componentes críticos del motor durante el servicio del elemento primario y extendiendo los intervalos de mantenimiento mientras reduce el tiempo de inactividad operacional.',
      },
      airdryer: {
        en: 'ELIMFILTERS® Air Dryer, Desiccant and Coalescing developed for industrial asset protection of compressed air systems. Its DRYCORE™ technology removes water vapor and oil vapor at the molecular level before they reach air tanks, valves and downstream control circuits, preventing corrosion, seal degradation and ensuring optimal system uptime.',
        es: 'ELIMFILTERS® Secador de aire, desecante y coalescente desarrollado para la protección de activos industriales en sistemas de aire comprimido. Su tecnología DRYCORE™ elimina el vapor de agua y el vapor de aceite a nivel molecular antes de que lleguen a los depósitos de aire, válvulas y circuitos de control, previniendo la corrosión, el deterioro de sellos y garantizando el tiempo de operación óptimo del sistema.',
      },
      coolant: {
        en: 'ELIMFILTERS® Coolant Filter developed for thermal system asset protection. Its COOLTECH™ technology delivers controlled SCA additive release alongside coolant filtration, preventing liner pitting, scale formation and corrosive degradation of engine cooling circuits.',
        es: 'ELIMFILTERS® Filtro de refrigerante desarrollado para la protección de activos en sistemas térmicos. Su tecnología COOLTECH™ administra la liberación controlada de aditivos SCA junto con la filtración del refrigerante, previniendo la erosión por cavitación en camisas, formación de depósitos y degradación corrosiva en los circuitos de enfriamiento del motor.',
      },
      hydraulic_spinon: {
        en: 'ELIMFILTERS® Hydraulic Filter, Spin-On developed for industrial asset protection of precision hydraulic systems. Its NANOFORCE™ technology maintains filtration performance under sustained high-pressure pulsation cycles, protecting proportional valves and actuator components from sub-micron particle wear.',
        es: 'ELIMFILTERS® Filtro hidráulico tipo spin-on desarrollado para la protección de activos industriales en sistemas hidráulicos de precisión. Su tecnología NANOFORCE™ mantiene el rendimiento de filtración bajo ciclos sostenidos de pulsación de alta presión, protegiendo válvulas proporcionales y componentes actuadores del desgaste por partículas sub-micrón.',
      },
      hydraulic_cartridge: {
        en: 'ELIMFILTERS® Hydraulic Filter, Cartridge developed for industrial asset protection of precision hydraulic systems and to minimize environmental impact. Its NANOFORCE™ technology maintains filtration performance under sustained high-pressure pulsation cycles, protecting proportional valves and actuator components from sub-micron particle wear.',
        es: 'ELIMFILTERS® Filtro hidráulico tipo cartucho desarrollado para la protección de activos industriales en sistemas hidráulicos de precisión y para minimizar el impacto ambiental en operaciones industriales. Su tecnología NANOFORCE™ mantiene el rendimiento de filtración bajo ciclos sostenidos de pulsación de alta presión, protegiendo válvulas proporcionales y componentes actuadores del desgaste por partículas sub-micrón.',
      },
      fws_spinon: {
        en: 'ELIMFILTERS® Fuel/Water Separator, Spin-On developed for industrial asset protection against water contamination in fuel systems. Its AQUAGUARD™ technology achieves three-phase water interception — free, emulsified and dissolved — protecting Common Rail injectors and fuel system components from corrosive water-induced degradation.',
        es: 'ELIMFILTERS® Separador combustible/agua tipo spin-on desarrollado para la protección de activos industriales contra la contaminación por agua en sistemas de combustible. Su tecnología AQUAGUARD™ logra la interceptación trifásica del agua — libre, emulsionada y disuelta — protegiendo los inyectores Common Rail y los componentes del sistema de combustible de la degradación corrosiva inducida por el agua.',
      },
      fws_cartridge: {
        en: 'ELIMFILTERS® Fuel/Water Separator, Cartridge developed for industrial asset protection against water contamination in fuel systems. Its AQUAGUARD™ technology achieves three-phase water interception — free, emulsified and dissolved — protecting Common Rail injectors and fuel system components from corrosive water-induced degradation.',
        es: 'ELIMFILTERS® Separador combustible/agua tipo cartucho desarrollado para la protección de activos industriales contra la contaminación por agua en sistemas de combustible. Su tecnología AQUAGUARD™ logra la interceptación trifásica del agua — libre, emulsionada y disuelta — protegiendo los inyectores Common Rail y los componentes del sistema de combustible de la degradación corrosiva inducida por el agua.',
      },
      fuel_inline: {
        en: 'ELIMFILTERS® Fuel Filter, In-Line developed for industrial asset protection of fuel delivery systems. Its SYNTEPORE™ technology provides compact in-line contamination interception, maintaining fuel cleanliness through the final delivery stage before primary filtration or as a secondary protection barrier in high-demand applications.',
        es: 'ELIMFILTERS® Filtro de combustible en línea desarrollado para la protección de activos industriales en sistemas de suministro de combustible. Su tecnología SYNTEPORE™ proporciona interceptación compacta de contaminación en línea, manteniendo la limpieza del combustible en la etapa de suministro final antes de la filtración primaria o como barrera de protección secundaria en aplicaciones de alta demanda.',
      },
      fuel_spinon: {
        en: 'ELIMFILTERS® Fuel Filter, Spin-On developed for industrial asset protection of high-pressure fuel systems. Its SYNTEPORE™ technology intercepts sub-micron contamination before it reaches Common Rail injectors, maintaining injection precision and protecting fuel system components from abrasive particle wear.',
        es: 'ELIMFILTERS® Filtro de combustible tipo spin-on desarrollado para la protección de activos industriales en sistemas de combustible de alta presión. Su tecnología SYNTEPORE™ intercepta la contaminación sub-micrón antes de que alcance los inyectores Common Rail, manteniendo la precisión de inyección y protegiendo los componentes del sistema de combustible del desgaste por partículas abrasivas.',
      },
      fuel_cartridge: {
        en: 'ELIMFILTERS® Fuel Filter, Cartridge developed for industrial asset protection of high-pressure fuel systems and to minimize environmental impact. Its SYNTEPORE™ technology intercepts sub-micron contamination before it reaches Common Rail injectors, maintaining injection precision and protecting fuel system components from abrasive particle wear.',
        es: 'ELIMFILTERS® Filtro de combustible tipo cartucho desarrollado para la protección de activos industriales en sistemas de combustible de alta presión y para minimizar el impacto ambiental en operaciones industriales. Su tecnología SYNTEPORE™ intercepta la contaminación sub-micrón antes de que alcance los inyectores Common Rail, manteniendo la precisión de inyección y protegiendo los componentes del sistema de combustible del desgaste por partículas abrasivas.',
      },
      crankcase: {
        en: 'ELIMFILTERS® Crankcase Ventilation Filter developed for industrial asset protection of engine lube and air intake systems. Its SYNTRAX™ technology separates oil aerosols and blow-by gas contaminants from crankcase emissions, preventing oil loss and protecting air intake components from hydrocarbon contamination.',
        es: 'ELIMFILTERS® Filtro de ventilación del cárter desarrollado para la protección de activos industriales en sistemas de lubricación y admisión de aire del motor. Su tecnología SYNTRAX™ separa los aerosoles de aceite y contaminantes de los gases de blow-by, previniendo la pérdida de lubricante y protegiendo los componentes del sistema de admisión de la contaminación por hidrocarburos.',
      },
    };

    // Spin-on: installation_type contains 'Spin-On' or sub_type contains 'Spin'
    const spinRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%lube%'
         AND (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
              OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.spinon)]
    );

    // Cartridge: everything else in lube
    const cartRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%lube%'
         AND NOT (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
                  OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.cartridge)]
    );

    // Centrifuge rotor
    const centRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%centrifug%'
       RETURNING sku`,
      [JSON.stringify(DESC.centrifuge)]
    );

    // Cabin air filter
    const cabinRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%cabin%'
       RETURNING sku`,
      [JSON.stringify(DESC.cabin)]
    );

    // Air filter housing
    const housingRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%housing%'
       RETURNING sku`,
      [JSON.stringify(DESC.airhousing)]
    );

    // Air precleaner
    const precleanRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%precleaner%'
          OR LOWER(filter_type) LIKE '%pre-cleaner%'
          OR LOWER(filter_type) LIKE '%pre cleaner%'
       RETURNING sku`,
      [JSON.stringify(DESC.precleaner)]
    );

    // Air filters — secondary/safety element
    const airSecRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%air%'
         AND LOWER(filter_type) NOT LIKE '%cabin%'
         AND LOWER(filter_type) NOT LIKE '%housing%'
         AND (LOWER(COALESCE(sub_type,'')) LIKE '%secondary%'
              OR LOWER(COALESCE(sub_type,'')) LIKE '%safety%'
              OR LOWER(filter_type) LIKE '%secondary%')
       RETURNING sku`,
      [JSON.stringify(DESC.air_secondary)]
    );

    // Air filters — radial seal primary
    const airRadRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%air%'
         AND LOWER(filter_type) NOT LIKE '%cabin%'
         AND LOWER(filter_type) NOT LIKE '%housing%'
         AND LOWER(sub_type) NOT LIKE '%secondary%'
         AND (LOWER(COALESCE(sub_type,'')) LIKE '%radial%'
              OR LOWER(COALESCE(installation_type,'')) LIKE '%radial%')
       RETURNING sku`,
      [JSON.stringify(DESC.air_radial)]
    );

    // Air filters — axial seal primary
    const airAxRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%air%'
         AND LOWER(filter_type) NOT LIKE '%cabin%'
         AND LOWER(filter_type) NOT LIKE '%housing%'
         AND LOWER(sub_type) NOT LIKE '%secondary%'
         AND (LOWER(COALESCE(sub_type,'')) LIKE '%axial%'
              OR LOWER(COALESCE(installation_type,'')) LIKE '%axial%')
         AND LOWER(COALESCE(sub_type,'')) NOT LIKE '%radial%'
       RETURNING sku`,
      [JSON.stringify(DESC.air_axial)]
    );

    // Air filters — TetraMax primary
    const airTetRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%air%'
         AND LOWER(filter_type) NOT LIKE '%cabin%'
         AND LOWER(filter_type) NOT LIKE '%housing%'
         AND LOWER(sub_type) NOT LIKE '%secondary%'
         AND (LOWER(COALESCE(sub_type,'')) LIKE '%tetra%'
              OR LOWER(COALESCE(installation_type,'')) LIKE '%tetra%')
       RETURNING sku`,
      [JSON.stringify(DESC.air_tetramax)]
    );

    // Air dryer
    const airDryRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%dryer%'
          OR LOWER(filter_type) LIKE '%drier%'
       RETURNING sku`,
      [JSON.stringify(DESC.airdryer)]
    );

    // Coolant filter
    const coolantRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%coolant%'
       RETURNING sku`,
      [JSON.stringify(DESC.coolant)]
    );

    // Hydraulic spin-on
    const hydSpinRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%hydraulic%'
         AND (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
              OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.hydraulic_spinon)]
    );

    // Hydraulic cartridge (everything else in hydraulic)
    const hydCartRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%hydraulic%'
         AND NOT (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
                  OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.hydraulic_cartridge)]
    );

    // Fuel/Water Separator spin-on (Racor turbine style, spin-on assembly)
    const fwsSpinRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%turbine%'
         AND LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
       RETURNING sku`,
      [JSON.stringify(DESC.fws_spinon)]
    );

    // Fuel/Water Separator cartridge (Racor turbine style, cartridge/assembly)
    const fwsCartRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%turbine%'
         AND NOT (LOWER(COALESCE(installation_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.fws_cartridge)]
    );

    // Fuel in-line — check installation_type, not filter_type
    const fuelInlineRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%fuel%'
         AND (LOWER(COALESCE(installation_type,'')) LIKE '%in-line%'
              OR LOWER(COALESCE(installation_type,'')) LIKE '%in line%'
              OR LOWER(COALESCE(installation_type,'')) LIKE '%inline%')
       RETURNING sku`,
      [JSON.stringify(DESC.fuel_inline)]
    );

    // Fuel spin-on (plain fuel, not water separator, not inline)
    const fuelSpinRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%fuel%'
         AND LOWER(filter_type) NOT LIKE '%water%'
         AND LOWER(filter_type) NOT LIKE '%separator%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%in-line%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%inline%'
         AND (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
              OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.fuel_spinon)]
    );

    // Fuel cartridge (plain fuel, everything else)
    const fuelCartRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%fuel%'
         AND LOWER(filter_type) NOT LIKE '%water%'
         AND LOWER(filter_type) NOT LIKE '%separator%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%in-line%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%inline%'
         AND NOT (LOWER(COALESCE(installation_type,'')) LIKE '%spin%'
                  OR LOWER(COALESCE(sub_type,'')) LIKE '%spin%')
       RETURNING sku`,
      [JSON.stringify(DESC.fuel_cartridge)]
    );

    // Crankcase ventilation
    const crankcaseRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%crankcase%'
          OR LOWER(filter_type) LIKE '%ventilation%'
          OR LOWER(filter_type) LIKE '%breather%'
       RETURNING sku`,
      [JSON.stringify(DESC.crankcase)]
    );

    // Air filters — Powercore/advanced primary (everything else primary)
    const airPowRes = await client.query(
      `UPDATE elimfilters_catalog
       SET description = $1::jsonb
       WHERE LOWER(filter_type) LIKE '%air%'
         AND LOWER(filter_type) NOT LIKE '%cabin%'
         AND LOWER(filter_type) NOT LIKE '%housing%'
         AND LOWER(filter_type) NOT LIKE '%precleaner%'
         AND LOWER(filter_type) NOT LIKE '%pre-cleaner%'
         AND LOWER(sub_type) NOT LIKE '%secondary%'
         AND LOWER(COALESCE(sub_type,'')) NOT LIKE '%radial%'
         AND LOWER(COALESCE(sub_type,'')) NOT LIKE '%axial%'
         AND LOWER(COALESCE(sub_type,'')) NOT LIKE '%tetra%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%radial%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%axial%'
         AND LOWER(COALESCE(installation_type,'')) NOT LIKE '%tetra%'
       RETURNING sku`,
      [JSON.stringify(DESC.air_powercore)]
    );

    res.json({
      spin_on_updated: spinRes.rowCount,
      cartridge_updated: cartRes.rowCount,
      centrifuge_updated: centRes.rowCount,
      cabin_updated: cabinRes.rowCount,
      air_housing_updated: housingRes.rowCount,
      precleaner_updated: precleanRes.rowCount,
      air_secondary_updated: airSecRes.rowCount,
      air_radial_updated: airRadRes.rowCount,
      air_axial_updated: airAxRes.rowCount,
      air_tetramax_updated: airTetRes.rowCount,
      air_powercore_updated: airPowRes.rowCount,
      air_dryer_updated: airDryRes.rowCount,
      coolant_updated: coolantRes.rowCount,
      hydraulic_spinon_updated: hydSpinRes.rowCount,
      hydraulic_cartridge_updated: hydCartRes.rowCount,
      fws_spinon_updated: fwsSpinRes.rowCount,
      fws_cartridge_updated: fwsCartRes.rowCount,
      fuel_inline_updated: fuelInlineRes.rowCount,
      fuel_spinon_updated: fuelSpinRes.rowCount,
      fuel_cartridge_updated: fuelCartRes.rowCount,
      crankcase_updated: crankcaseRes.rowCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally { await client.end(); }
});

app.use(cors());
app.set('trust proxy', 1);
app.use(express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
const frontendStatic = express.static('frontend/out');
const partSearchStatic = express.static('part-search');

app.use((req, res, next) => {
  const host = req.get('host') || req.hostname || '';
  if (host.includes('part-search')) {
    partSearchStatic(req, res, next);
  } else {
    frontendStatic(req, res, next);
  }
});
app.use(express.static('public'));
app.use(express.static('www'));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: 'info@elimfilters.com',
        pass: process.env.GODADDY_MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      replyTo: email,
      subject: `[Web Contact] ${name} — ${company || 'No company'}`,
      html: `
        <h2 style="color:#000">New contact from elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%">
          <tr><td><b>Name</b></td><td>${name}</td></tr>
          <tr><td><b>Email</b></td><td>${email}</td></tr>
          <tr><td><b>Phone</b></td><td>${phone || '—'}</td></tr>
          <tr><td><b>Company</b></td><td>${company || '—'}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background:#f5f5f5;padding:1rem">${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Import routes (with fallback if file is missing)
let knowledgeRoutes;
try {
  knowledgeRoutes = require('./routes/knowledge.routes');
  console.log('[routes] Knowledge routes loaded ✅');
} catch (err) {
  console.error('[routes] Failed to load knowledge routes:', err.message);
  // Create dummy router if knowledge routes fail
  const express = require('express');
  knowledgeRoutes = express.Router();
  knowledgeRoutes.get('/', (req, res) => res.json({ status: 'knowledge-api-unavailable' }));
}

// Middleware para encoding UTF-8 — solo rutas API, no archivos estáticos ni webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

function parseRefs(arr){
  if(!arr) return [];
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code
  }));
}

function detectLang(req) {
  const langs = (req.headers['accept-language'] || '').toLowerCase()
    .split(',').map(l => l.split(';')[0].trim());
  return langs.some(l => l.startsWith('es')) ? 'es' : 'en';
}

const PROPRIETARY_SUBTYPES = new Set([
  'synteq xp', 'synteq', 'ultra-web nanofiber', 'aquabloc® ii', 'aquabloc ii',
  'alpha-web™', 'alpha-web', 'synteq xp™',
]);
function safeSubtype(val, lang = 'en') {
  const text = extractText(val, lang);
  if (!text) return null;
  if (/[®™]/.test(text)) return null;
  if (PROPRIETARY_SUBTYPES.has(text.toLowerCase())) return null;
  return text;
}

function extractText(val, lang = 'en') {
  if (val === null || val === undefined) return null;
  // Already an object (JSONB from pg)
  if (typeof val === 'object' && !Array.isArray(val)) {
    return val[lang] || val.en || val.es || Object.values(val)[0] || null;
  }
  // String – may be raw text OR a JSON-encoded object
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const p = JSON.parse(trimmed);
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return p[lang] || p.en || p.es || Object.values(p)[0] || val;
        }
      } catch (_) {}
    }
    return val; // plain text
  }
  return String(val);
}

const TECH_LOGO_MAP = {
  'syntrax': 'sintrax', 'sintrax': 'sintrax',
  'nanoforce': 'nanoforce',
  'macrocore': 'macrocore',
  'intekcore': 'intekcore',
  'drycore': 'drycore',
  'duratech': 'duratech',
  'cooltech': 'cooltech',
  'syntepore': 'syntepore',
  'microkappa': 'microkappa',
  'gasultra': 'gasultra',
  'aquaguard': 'aquaguard',
  'marineclean': 'marineclean',
  'blueclean': 'blueclean',
};

function getTechLogo(tech) {
  if (!tech) return null;
  const key = tech.toLowerCase().replace(/[™®\s™]/g, '').trim();
  const mapped = TECH_LOGO_MAP[key];
  return mapped ? `/assets/logo-${mapped}.png` : null;
}

function buildFilterData(row, lang = 'en'){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    description: row.description || null,
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: safeSubtype(row.sub_type, lang),
    technology: row.technology || null,
    technology_logo: getTechLogo(row.technology),
    installation_type: row.installation_type || null,
    thread_size: row.thread_size || null,
    height_mm: row.height_mm || null,
    outer_diameter_mm: row.outer_diameter_mm || null,
    gasket_od_mm: row.gasket_od_mm || null,
    gasket_id_mm: row.gasket_id_mm || null,
    iso_test_method: row.iso_test_method || null,
    micron_rating: row.micron_rating || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty: row.duty || null,
    oem_codes: parseRefs(row.oem_codes),
    competitor_codes: parseRefs(row.competitor_codes),
    brand_crossrefs: row.brand_crossrefs || {},
    alternatives: row.alternatives || [],
    equipment_applications: row.equipment_applications || []
  };
}

// Duplicate status route removed — the authoritative one is at top of file (v3.8.0)

app.get('/api/debug/inspect-codes/:sku', async (req, res) => {
  const sku = req.params.sku.toUpperCase();
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT sku, oem_codes, competitor_codes FROM elimfilters_catalog WHERE sku = $1`,
      [sku]
    );
    res.json(result.rows.length > 0 ? result.rows[0] : {error: 'not found'});
  } catch(e) {
    res.json({ error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/debug/find-code/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT sku, codigo_base,
        oem_codes,
        competitor_codes
       FROM elimfilters_catalog
       WHERE oem_codes::text ILIKE $1
          OR competitor_codes::text ILIKE $1
       LIMIT 10`,
      [`%${code}%`]
    );
    res.json({ code, found: result.rows.length, results: result.rows });
  } catch(e) {
    res.json({ error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze SKU correctness (calculate expected SKU from codigo_base + filter_type)
app.get('/api/analyze/sku-correctness', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        id, sku, filter_type, codigo_base, duty,
        CASE filter_type
          WHEN 'Air Filter'            THEN 'EA1'
          WHEN 'Air Housing'           THEN 'EA2'
          WHEN 'Air Dryer'             THEN 'ED4'
          WHEN 'Hydraulic Filter'      THEN 'EH6'
          WHEN 'Oil Filter'            THEN 'EL8'
          WHEN 'Marine Filter'         THEN 'EM9'
          WHEN 'Fuel/Water Separator'  THEN 'ES9'
          WHEN 'Turbine Filter'        THEN 'ET9'
          WHEN 'Cabin Air Filter'      THEN 'EC1'
          WHEN 'Fuel Filter'           THEN 'EF9'
          WHEN 'Coolant Filter'        THEN 'EW7'
          WHEN 'Kit Filter'            THEN CASE WHEN duty = 'HD' THEN 'EK3' ELSE 'EK5' END
          ELSE NULL
        END AS expected_prefix,
        CASE filter_type
          -- Turbina FH: primeros 4 dígitos
          WHEN 'Turbine Filter' THEN
            (CASE WHEN codigo_base ILIKE '%FH%' THEN 'ET9' ELSE 'ET9' END) ||
            LPAD(SUBSTRING(REGEXP_REPLACE(codigo_base, '[^0-9]', '', 'g'), 1, 4), 4, '0')
          -- Otros: últimos 4 dígitos
          ELSE
            (CASE filter_type
              WHEN 'Air Filter'            THEN 'EA1'
              WHEN 'Air Housing'           THEN 'EA2'
              WHEN 'Air Dryer'             THEN 'ED4'
              WHEN 'Hydraulic Filter'      THEN 'EH6'
              WHEN 'Oil Filter'            THEN 'EL8'
              WHEN 'Marine Filter'         THEN 'EM9'
              WHEN 'Fuel/Water Separator'  THEN 'ES9'
              WHEN 'Cabin Air Filter'      THEN 'EC1'
              WHEN 'Fuel Filter'           THEN 'EF9'
              WHEN 'Coolant Filter'        THEN 'EW7'
              WHEN 'Kit Filter'            THEN CASE WHEN duty = 'HD' THEN 'EK3' ELSE 'EK5' END
              ELSE NULL
            END) || LPAD(RIGHT(REGEXP_REPLACE(codigo_base, '[^0-9]', '', 'g'), 4), 4, '0')
        END AS expected_sku
      FROM elimfilters_catalog
      WHERE filter_type IS NOT NULL AND codigo_base IS NOT NULL
      ORDER BY expected_sku LIMIT 50
    `);
    // Count mismatches
    const mismatches = result.rows.filter(r => r.sku !== r.expected_sku);
    res.json({
      success: true,
      total_checked: result.rows.length,
      mismatches_count: mismatches.length,
      sample_mismatches: mismatches.slice(0, 15)
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze duplicate SKUs + calculate correct SKU for each codigo_base
app.get('/api/analyze/duplicate-skus-with-fix', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT
        c.sku,
        c.filter_type,
        c.codigo_base,
        c.duty,
        COUNT(*) OVER (PARTITION BY c.sku) as dup_count,
        CASE c.filter_type
          WHEN 'Air Filter'            THEN 'EA1'
          WHEN 'Air Housing'           THEN 'EA2'
          WHEN 'Air Dryer'             THEN 'ED4'
          WHEN 'Hydraulic Filter'      THEN 'EH6'
          WHEN 'Oil Filter'            THEN 'EL8'
          WHEN 'Marine Filter'         THEN 'EM9'
          WHEN 'Fuel/Water Separator'  THEN 'ES9'
          WHEN 'Turbine Filter'        THEN 'ET9'
          WHEN 'Cabin Air Filter'      THEN 'EC1'
          WHEN 'Fuel Filter'           THEN 'EF9'
          WHEN 'Coolant Filter'        THEN 'EW7'
          WHEN 'Kit Filter'            THEN CASE WHEN c.duty = 'HD' THEN 'EK3' ELSE 'EK5' END
          ELSE NULL
        END AS prefix,
        CASE c.filter_type
          WHEN 'Turbine Filter' THEN
            'ET9' || LPAD(SUBSTRING(REGEXP_REPLACE(c.codigo_base, '[^0-9]', '', 'g'), 1, 4), 4, '0')
          ELSE
            (CASE c.filter_type
              WHEN 'Air Filter'            THEN 'EA1'
              WHEN 'Air Housing'           THEN 'EA2'
              WHEN 'Air Dryer'             THEN 'ED4'
              WHEN 'Hydraulic Filter'      THEN 'EH6'
              WHEN 'Oil Filter'            THEN 'EL8'
              WHEN 'Marine Filter'         THEN 'EM9'
              WHEN 'Fuel/Water Separator'  THEN 'ES9'
              WHEN 'Cabin Air Filter'      THEN 'EC1'
              WHEN 'Fuel Filter'           THEN 'EF9'
              WHEN 'Coolant Filter'        THEN 'EW7'
              WHEN 'Kit Filter'            THEN CASE WHEN c.duty = 'HD' THEN 'EK3' ELSE 'EK5' END
              ELSE NULL
            END) || LPAD(RIGHT(REGEXP_REPLACE(c.codigo_base, '[^0-9]', '', 'g'), 4), 4, '0')
        END AS correct_sku
      FROM elimfilters_catalog c
      WHERE c.sku IN (
        SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1
      )
      ORDER BY c.sku, c.codigo_base
      LIMIT 100
    `);
    res.json({ success: true, total: dupes.rows.length, records: dupes.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: find duplicate SKUs
app.get('/api/analyze/duplicate-skus', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT sku, COUNT(*) as count, ARRAY_AGG(codigo_base) as codigo_bases
      FROM elimfilters_catalog
      GROUP BY sku
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    res.json({ success: true, duplicate_count: dupes.rows.length, duplicates: dupes.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: add UNIQUE constraint to sku column (after deduplicating)
app.get('/api/migrate/fix-sku-unique', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();

    // First, delete duplicate rows (keep only the first occurrence of each SKU)
    await client.query(`
      DELETE FROM elimfilters_catalog
      WHERE id NOT IN (
        SELECT MIN(id) FROM elimfilters_catalog GROUP BY sku
      )
    `);

    // Now add the UNIQUE constraint
    await client.query(`
      ALTER TABLE elimfilters_catalog
      ADD CONSTRAINT sku_unique UNIQUE (sku)
    `);
    res.json({ success: true, message: 'Duplicates removed and UNIQUE constraint added' });
  } catch(e) {
    if (e.message.includes('already exists')) {
      return res.json({ success: true, message: 'Constraint already exists' });
    }
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: create maintenance_kits and kit_components tables
app.get('/api/migrate/create-kit-tables', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_kits (
        kit_sku    VARCHAR(7) PRIMARY KEY,
        name       TEXT NOT NULL,
        equipment_ref TEXT,
        duty       VARCHAR(2) CHECK (duty IN ('HD','LD')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS kit_components (
        kit_sku    VARCHAR(7) REFERENCES maintenance_kits(kit_sku) ON DELETE CASCADE,
        filter_sku VARCHAR(7) REFERENCES elimfilters_catalog(sku),
        PRIMARY KEY (kit_sku, filter_sku)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_kit_components_filter
      ON kit_components(filter_sku)
    `);
    res.json({ success: true, message: 'Tables maintenance_kits and kit_components created' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// POST /api/kits — create a kit from filter SKUs + equipment name
app.post('/api/kits', async (req, res) => {
  const { name, equipment_ref, filter_skus } = req.body;
  if (!name || !Array.isArray(filter_skus) || filter_skus.length === 0)
    return res.status(400).json({ success: false, error: 'name and filter_skus[] required' });

  const client = new Client(dbConfig);
  try {
    await client.connect();

    // Determine duty from the first filter found
    const sample = await client.query(
      'SELECT duty FROM elimfilters_catalog WHERE sku = ANY($1) AND duty IS NOT NULL LIMIT 1',
      [filter_skus]
    );
    const duty = sample.rows[0]?.duty || 'LD';
    const prefix = duty === 'HD' ? 'EK3' : 'EK5';

    // Generate next kit SKU
    const last = await client.query(
      `SELECT kit_sku FROM maintenance_kits WHERE kit_sku LIKE $1 ORDER BY kit_sku DESC LIMIT 1`,
      [prefix + '%']
    );
    const nextNum = last.rows.length
      ? String(parseInt(last.rows[0].kit_sku.slice(3)) + 1).padStart(4, '0')
      : '0001';
    const kit_sku = prefix + nextNum;

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO maintenance_kits (kit_sku, name, equipment_ref, duty) VALUES ($1,$2,$3,$4)',
      [kit_sku, name, equipment_ref || null, duty]
    );
    for (const fsku of filter_skus) {
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [kit_sku, fsku.toUpperCase()]
      );
    }
    await client.query('COMMIT');

    res.status(201).json({ success: true, kit_sku, duty, name, equipment_ref, filter_skus });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// GET /api/kits/:kit_sku — full kit details with all component filters
app.get('/api/kits/:kit_sku', async (req, res) => {
  const kit_sku = req.params.kit_sku.trim().toUpperCase();
  const lang = detectLang(req);
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const kit = await client.query(
      'SELECT * FROM maintenance_kits WHERE kit_sku = $1',
      [kit_sku]
    );
    if (!kit.rows.length) return res.status(404).json({ success: false, error: 'Kit not found' });

    const components = await client.query(
      `SELECT c.*, kc.kit_sku
       FROM elimfilters_catalog c
       JOIN kit_components kc ON kc.filter_sku = c.sku
       WHERE kc.kit_sku = $1`,
      [kit_sku]
    );

    res.json({
      success: true,
      kit: {
        kit_sku: kit.rows[0].kit_sku,
        name: kit.rows[0].name,
        equipment_ref: kit.rows[0].equipment_ref,
        duty: kit.rows[0].duty,
        filters: components.rows.map(row => buildFilterData(row, lang))
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// GET /api/filters/kits?sku=XXX — which kits contain this filter
app.get('/api/filters/kits', async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({ success: false, kits: [] });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT mk.kit_sku, mk.name, mk.equipment_ref, mk.duty
       FROM maintenance_kits mk
       JOIN kit_components kc ON kc.kit_sku = mk.kit_sku
       WHERE kc.filter_sku = $1`,
      [sku]
    );
    res.json({ success: true, kits: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: find SKUs for RAV4 2022 kit components with duty
app.get('/api/search/rav4-kit-skus', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT sku, name, filter_type, sub_type, duty, codigo_base, thread_size
      FROM elimfilters_catalog
      WHERE sku IN ('EL84967','EA19762','EA12377','EC10285')
      ORDER BY sku
    `);
    res.json({ found: result.rows, found_count: result.rows.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/filters/alternatives', async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({success: false, alternatives: []});

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const src = await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1', [sku]);
    if (!src.rows.length) return res.json({success: true, alternatives: []});

    const f = src.rows[0];
    const params = [sku, f.filter_type, f.sub_type];
    let conditions = `sku != $1 AND filter_type = $2 AND sub_type = $3`;

    if (f.thread_size) {
      conditions += ` AND thread_size = $4`;
      params.push(f.thread_size);
    } else if (f.outer_diameter_mm) {
      conditions += ` AND ABS(COALESCE(outer_diameter_mm,0) - $4) <= 5`;
      params.push(f.outer_diameter_mm);
    } else if (f.height_mm) {
      conditions += ` AND ABS(COALESCE(height_mm,0) - $4) <= 10`;
      params.push(f.height_mm);
    }

    const result = await client.query(
      `SELECT sku, name FROM elimfilters_catalog WHERE ${conditions} LIMIT 6`,
      params
    );
    res.json({success: true, alternatives: result.rows});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/part', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE codigo_base = $1 LIMIT 1',
      [code]
    );

    if(result.rows.length === 0) {
      result = await client.query(
        'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
        [code]
      );
    }

    if(result.rows.length === 0) {
      // Búsqueda exacta en oem_codes y competitor_codes (formato {code/partNumber})
      // Prioriza productos con más datos completos (campos no nulos)
      result = await client.query(
        `SELECT * FROM elimfilters_catalog WHERE
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(oem_codes) AS elem(val)
            WHERE UPPER(val->>'code') = $1
               OR UPPER(val->>'partNumber') = $1
               OR (jsonb_typeof(val) = 'string' AND UPPER(val#>>'{}') ~ ('^[^|]+\\|\\s*' || $1 || '$'))
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(competitor_codes) AS elem(val)
            WHERE UPPER(val->>'code') = $1
               OR UPPER(val->>'partNumber') = $1
               OR (jsonb_typeof(val) = 'string' AND UPPER(val#>>'{}') ~ ('^[^|]+\\|\\s*' || $1 || '$'))
               OR (jsonb_typeof(val) = 'string' AND UPPER(val#>>'{}') = $1)
          )
        ORDER BY
          CASE WHEN array_length(COALESCE(alternative_codes, '{}'::jsonb[]), 1) > 0
               THEN 0
               ELSE 1
          END ASC,
          sku ASC
        LIMIT 1`,
        [code]
      );
    }

    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/vin', async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/equipment', async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const type = req.query.type ? req.query.type.trim().toUpperCase() : null;
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(type) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + type + '%');
    }

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/homologous', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
      [code]
    );
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});


// Temp: consolidate duplicate SKUs (preview consolidation plan)
app.get('/api/migrate/consolidate-skus-preview', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT sku, ARRAY_AGG(id ORDER BY id) as ids, ARRAY_AGG(codigo_base ORDER BY codigo_base) as codigos,
             ARRAY_AGG(duty ORDER BY duty) as duties
      FROM elimfilters_catalog
      WHERE sku IN (SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1)
      GROUP BY sku
      ORDER BY sku
      LIMIT 50
    `);

    const plan = dupes.rows.map(row => {
      const donaldson = row.codigos.find(c => c && c.match(/^P[0-9]/));
      const fram = row.codigos.find(c => c && !c.match(/^P[0-9]/));
      const primary = donaldson || fram;
      const alternates = row.codigos.filter(c => c !== primary);

      return {
        sku: row.sku,
        keep_id: row.ids[0],
        keep_codigo_base: primary,
        keep_duty: donaldson ? 'HD' : 'LD',
        delete_ids: row.ids.slice(1),
        competitor_codes: alternates.map(c => ({ code: c, manufacturer: '...' }))
      };
    });

    res.json({ success: true, consolidations_count: plan.length, preview: plan });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: apply consolidation (delete duplicates, merge competitor_codes)
app.get('/api/migrate/consolidate-skus-apply', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('BEGIN');

    // Get all groups of duplicates
    const dupes = await client.query(`
      SELECT sku, ARRAY_AGG(id ORDER BY id) as ids, ARRAY_AGG(codigo_base ORDER BY codigo_base) as codigos
      FROM elimfilters_catalog
      WHERE sku IN (SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1)
      GROUP BY sku
    `);

    let consolidated = 0;
    for (const row of dupes.rows) {
      const donaldson = row.codigos.find(c => c && c.match(/^P[0-9]/));
      const fram = row.codigos.find(c => c && !c.match(/^P[0-9]/));
      const primary = donaldson || fram;
      const alternates = row.codigos.filter(c => c !== primary);

      // Update the keeper record with primary codigo_base
      await client.query(
        'UPDATE elimfilters_catalog SET codigo_base = $1, duty = $2 WHERE id = $3',
        [primary, donaldson ? 'HD' : 'LD', row.ids[0]]
      );

      // Merge alternates into competitor_codes
      if (alternates.length > 0) {
        const altCodes = alternates.map(c => ({ code: c, manufacturer: 'Alternative' }));
        await client.query(
          `UPDATE elimfilters_catalog
           SET competitor_codes = COALESCE(competitor_codes, '[]'::jsonb) || $1::jsonb
           WHERE id = $2`,
          [JSON.stringify(altCodes), row.ids[0]]
        );
      }

      // Delete the duplicate records
      for (const del_id of row.ids.slice(1)) {
        await client.query('DELETE FROM elimfilters_catalog WHERE id = $1', [del_id]);
      }
      consolidated++;
    }

    await client.query('COMMIT');
    res.json({ success: true, consolidated_count: consolidated });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze codigo_base prefixes (Donaldson identification)
app.get('/api/analyze/codigo-base-prefixes', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        SUBSTRING(codigo_base, 1, 3) as prefix,
        COUNT(*) as count,
        ARRAY_AGG(DISTINCT duty ORDER BY duty) as duties,
        ARRAY_AGG(DISTINCT SUBSTRING(codigo_base, 1, 1) ORDER BY SUBSTRING(codigo_base, 1, 1)) as first_char,
        ARRAY_AGG(DISTINCT LEFT(codigo_base, LEAST(5, LENGTH(codigo_base))) ORDER BY LEFT(codigo_base, LEAST(5, LENGTH(codigo_base)))) as sample_codes
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL AND codigo_base != ''
      GROUP BY prefix
      ORDER BY count DESC
    `);
    res.json({ success: true, prefixes: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: add alternative_codes column
app.get('/api/migrate/add-alternative-codes-column', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      ALTER TABLE elimfilters_catalog
      ADD COLUMN IF NOT EXISTS alternative_codes JSONB[] DEFAULT '{}'::jsonb[]
    `);
    res.json({ success: true, message: 'Column alternative_codes added' });
  } catch(e) {
    if (e.message.includes('already exists')) {
      return res.json({ success: true, message: 'Column already exists' });
    }
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: debug EL82100 vs EL81016 comparison
app.get('/api/debug/el82100-vs-el81016', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT id, sku, codigo_base, filter_type, sub_type, duty, technology,
             thread_size, outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency, burst_pressure_psi,
             collapse_pressure_psi, installation_type, oem_codes, competitor_codes,
             alternative_codes, name, description
      FROM elimfilters_catalog
      WHERE sku IN ('EL82100', 'EL81016')
      ORDER BY sku
    `);
    const rows = result.rows;
    const main = rows.find(r => r.sku === 'EL82100');
    const alt  = rows.find(r => r.sku === 'EL81016');
    const nullInMain = main ? Object.entries(main)
      .filter(([k,v]) => v === null && alt && alt[k] !== null)
      .map(([k]) => k) : [];
    res.json({ success: true, records: rows, fields_missing_in_EL82100: nullInMain });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Copia campos faltantes de EL81016 a EL82100 y registra alternativas
app.get('/api/migrate/merge-el82100-sql', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  if (req.query.confirm !== 'yes') return res.json({ error: 'Add ?confirm=yes' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      UPDATE elimfilters_catalog SET
        iso_test_method = COALESCE(iso_test_method, (SELECT iso_test_method FROM elimfilters_catalog WHERE sku='EL81016')),
        burst_pressure_psi = COALESCE(burst_pressure_psi, (SELECT burst_pressure_psi FROM elimfilters_catalog WHERE sku='EL81016')),
        collapse_pressure_psi = COALESCE(collapse_pressure_psi, (SELECT collapse_pressure_psi FROM elimfilters_catalog WHERE sku='EL81016')),
        installation_type = COALESCE(installation_type, (SELECT installation_type FROM elimfilters_catalog WHERE sku='EL81016')),
        oem_codes = (
          SELECT jsonb_agg(DISTINCT v)
          FROM (
            SELECT jsonb_array_elements(oem_codes) as v FROM elimfilters_catalog WHERE sku='EL82100'
            UNION ALL
            SELECT jsonb_array_elements(oem_codes) FROM elimfilters_catalog WHERE sku='EL81016'
          ) t
        ),
        competitor_codes = COALESCE(competitor_codes, (SELECT competitor_codes FROM elimfilters_catalog WHERE sku='EL81016')),
        alternative_codes = ARRAY['"P551016"'::jsonb, '"DBL3998"'::jsonb]
      WHERE sku='EL82100'
    `);
    res.json({ success: true, message: 'EL82100 merged successfully' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/catalog/stats', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const [total, byType, completeness, recent] = await Promise.all([
      client.query(`SELECT COUNT(*) as total FROM elimfilters_catalog`),
      client.query(`
        SELECT filter_type, duty, COUNT(*) as count
        FROM elimfilters_catalog
        GROUP BY filter_type, duty
        ORDER BY count DESC
      `),
      client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) > 0) as with_oem,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) > 0) as with_competitor,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) > 0) as with_equipment,
          COUNT(*) FILTER (WHERE iso_test_method IS NOT NULL) as with_iso,
          COUNT(*) FILTER (WHERE burst_pressure_psi IS NOT NULL) as with_burst
        FROM elimfilters_catalog
      `),
      client.query(`
        SELECT sku, filter_type, duty,
          jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) as oem_count,
          jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) as comp_count,
          jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) as equip_count
        FROM elimfilters_catalog
        ORDER BY id DESC LIMIT 10
      `)
    ]);
    res.json({
      success: true,
      total_skus: parseInt(total.rows[0].total),
      by_type: byType.rows,
      completeness: completeness.rows[0],
      last_10_inserted: recent.rows
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Merge OEM codes from EL81016 into EL82100
app.get('/api/migrate/merge-oem-codes', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  if (req.query.confirm !== 'yes') return res.json({ error: 'Add ?confirm=yes' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      UPDATE elimfilters_catalog SET
        oem_codes = oem_codes || (SELECT oem_codes FROM elimfilters_catalog WHERE sku='EL81016')
      WHERE sku='EL82100'
    `);
    res.json({ success: true, message: 'OEM codes merged successfully' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Audit: Find incomplete products
app.get('/api/audit/incomplete-products', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        sku, codigo_base,
        CASE WHEN iso_test_method IS NULL THEN 1 ELSE 0 END +
        CASE WHEN burst_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN collapse_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN installation_type IS NULL THEN 1 ELSE 0 END +
        CASE WHEN thread_size IS NULL THEN 1 ELSE 0 END as null_count,
        jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) as oem_count,
        jsonb_array_length(COALESCE(alternative_codes, '[]'::jsonb)) as alt_count
      FROM elimfilters_catalog
      WHERE sku LIKE 'EL%'
        AND (iso_test_method IS NULL OR burst_pressure_psi IS NULL
          OR collapse_pressure_psi IS NULL OR installation_type IS NULL)
      ORDER BY null_count DESC, oem_count ASC
      LIMIT 100
    `);
    res.json({ success: true, incomplete_count: result.rows.length, products: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/migrate/scrape-crossreferences', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});

  res.json({ message: 'Scraper started. Run: npm install puppeteer-extra puppeteer-extra-plugin-stealth && node scrape-crossreferences.js' });
});

// ─── POST /api/import/donaldson ──────────────────────────────────────────────
// Accepts batch of pre-processed rows and upserts into elimfilters_catalog.
// Body: { key: "elim2026", rows: [ { sku, codigo_base, filter_type, ... } ] }
app.post('/api/import/donaldson', async (req, res) => {
  if (req.body.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });

  const client = new Client(dbConfig);
  try {
    await client.connect();
    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      if (!row.sku || !row.codigo_base) { errors++; continue; }
      try {
        const result = await client.query(`
          INSERT INTO elimfilters_catalog (
            sku, codigo_base, description, filter_type, sub_type, technology,
            installation_type, thread_size,
            outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
            iso_test_method, micron_rating, nominal_efficiency,
            burst_pressure_psi, collapse_pressure_psi,
            duty,
            oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
            $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb
          )
          ON CONFLICT (sku) DO UPDATE SET
            codigo_base           = COALESCE(EXCLUDED.codigo_base,           elimfilters_catalog.codigo_base),
            description           = COALESCE(EXCLUDED.description,           elimfilters_catalog.description),
            filter_type           = COALESCE(EXCLUDED.filter_type,           elimfilters_catalog.filter_type),
            sub_type              = COALESCE(EXCLUDED.sub_type,              elimfilters_catalog.sub_type),
            technology            = COALESCE(EXCLUDED.technology,            elimfilters_catalog.technology),
            installation_type     = COALESCE(EXCLUDED.installation_type,     elimfilters_catalog.installation_type),
            thread_size           = COALESCE(EXCLUDED.thread_size,           elimfilters_catalog.thread_size),
            outer_diameter_mm     = COALESCE(EXCLUDED.outer_diameter_mm,     elimfilters_catalog.outer_diameter_mm),
            height_mm             = COALESCE(EXCLUDED.height_mm,             elimfilters_catalog.height_mm),
            gasket_od_mm          = COALESCE(EXCLUDED.gasket_od_mm,          elimfilters_catalog.gasket_od_mm),
            gasket_id_mm          = COALESCE(EXCLUDED.gasket_id_mm,          elimfilters_catalog.gasket_id_mm),
            iso_test_method       = COALESCE(EXCLUDED.iso_test_method,       elimfilters_catalog.iso_test_method),
            micron_rating         = COALESCE(EXCLUDED.micron_rating,         elimfilters_catalog.micron_rating),
            nominal_efficiency    = COALESCE(EXCLUDED.nominal_efficiency,    elimfilters_catalog.nominal_efficiency),
            burst_pressure_psi    = COALESCE(EXCLUDED.burst_pressure_psi,    elimfilters_catalog.burst_pressure_psi),
            collapse_pressure_psi = COALESCE(EXCLUDED.collapse_pressure_psi, elimfilters_catalog.collapse_pressure_psi),
            duty                  = COALESCE(EXCLUDED.duty,                  elimfilters_catalog.duty),
            oem_codes             = COALESCE(EXCLUDED.oem_codes,             elimfilters_catalog.oem_codes),
            competitor_codes      = COALESCE(EXCLUDED.competitor_codes,      elimfilters_catalog.competitor_codes),
            brand_crossrefs       = COALESCE(EXCLUDED.brand_crossrefs,       elimfilters_catalog.brand_crossrefs),
            alternatives          = COALESCE(EXCLUDED.alternatives,          elimfilters_catalog.alternatives),
            equipment_applications = COALESCE(EXCLUDED.equipment_applications, elimfilters_catalog.equipment_applications)
          RETURNING xmax
        `, [
          row.sku, row.codigo_base, row.description || null,
          row.filter_type || null, row.sub_type || null,
          row.technology || null,
          row.installation_type || null, row.thread_size || null,
          row.outer_diameter_mm || null, row.height_mm || null,
          row.gasket_od_mm || null, row.gasket_id_mm || null,
          row.iso_test_method || null, row.micron_rating || null,
          row.nominal_efficiency || null,
          row.burst_pressure_psi || null, row.collapse_pressure_psi || null,
          row.duty || 'HEAVY_DUTY',
          JSON.stringify(row.oem_codes || []),
          JSON.stringify(row.competitor_codes || []),
          JSON.stringify(row.brand_crossrefs || {}),
          JSON.stringify(row.alternatives || []),
          JSON.stringify(row.equipment_applications || [])
        ]);
        // xmax = 0 means insert, otherwise update
        if (result.rows && result.rows[0] && result.rows[0].xmax === '0') inserted++;
        else updated++;
      } catch (rowErr) {
        errors++;
        console.error('[import-err]', row.sku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, inserted, updated, errors });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/import/existing-skus ───────────────────────────────────────────
// Returns all existing SKUs so the client can avoid collisions.
app.get('/api/import/existing-skus', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT sku FROM elimfilters_catalog ORDER BY sku');
    res.json({ success: true, skus: result.rows.map(r => r.sku) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Register knowledge API for AI agents
try {
  app.use('/api/knowledge', knowledgeRoutes);
  console.log('[middleware] Knowledge API registered ✅');
} catch (err) {
  console.error('[middleware] Failed to register knowledge API:', err.message);
}


// ─── GET /api/migrate/init-db ────────────────────────────────────────────────
// Initializes database schema (tables, views, constraints)
app.get('/api/migrate/init-db', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    
    // 1. Table schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS elimfilters_catalog (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        codigo_base VARCHAR(100),
        description TEXT,
        filter_type VARCHAR(100),
        sub_type VARCHAR(100),
        technology VARCHAR(100),
        installation_type VARCHAR(100),
        thread_size VARCHAR(100),
        outer_diameter_mm NUMERIC,
        height_mm NUMERIC,
        gasket_od_mm NUMERIC,
        gasket_id_mm NUMERIC,
        iso_test_method VARCHAR(100),
        micron_rating NUMERIC,
        nominal_efficiency VARCHAR(100),
        burst_pressure_psi NUMERIC,
        collapse_pressure_psi NUMERIC,
        duty VARCHAR(50),
        oem_codes JSONB,
        competitor_codes JSONB,
        brand_crossrefs JSONB,
        alternatives JSONB,
        equipment_applications JSONB
      );
    `);

    // 2. Constraints
    await client.query('ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS sku_strict_format;');
    await client.query("ALTER TABLE elimfilters_catalog ADD CONSTRAINT sku_strict_format CHECK (sku ~ '^[A-Z]{2}[0-9]{4,7}[A-Z]?$');");

    // 3. View
    await client.query(`
      CREATE OR REPLACE VIEW filters AS 
      SELECT 
        sku, codigo_base as base_code, filter_type as category, 
        technology, installation_type as style, thread_size as thread,
        outer_diameter_mm as outer_diameter, height_mm as length,
        iso_test_method as type, 
        oem_codes, competitor_codes, equipment_applications as applications,
        sub_type as description, gasket_od_mm as inner_diameter, nominal_efficiency as efficiency, filter_type as media_type
      FROM elimfilters_catalog;
    `);

    console.log('[migrations] DB initialized successfully!');
    return res.json({ success: true, message: 'Database initialized successfully (tables, views, constraints)' });
  } catch (err) {
    console.error('[migrations] DB INIT ERROR:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/migrate/fix-sku-constraint ─────────────────────────────────────
app.get('/api/migrate/fix-sku-constraint', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS sku_strict_format;');
    await client.query("ALTER TABLE elimfilters_catalog ADD CONSTRAINT sku_strict_format CHECK (sku ~ '^[A-Z]{2}[0-9]{4,7}[A-Z]?$');");
    return res.json({ success: true, message: 'Constraint updated: accepts 4-7 digit SKU suffixes' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/migrate/reset-catalog ──────────────────────────────────────────
// Truncates catalog and ensures new columns exist. Confirms with ?confirm=yes
app.get('/api/migrate/reset-catalog', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  if (req.query.confirm !== 'yes') return res.status(400).json({ error: 'Add ?confirm=yes to proceed' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('TRUNCATE TABLE elimfilters_catalog RESTART IDENTITY;');
    // Add new columns if they don't exist yet (idempotent)
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS description TEXT;`);
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS brand_crossrefs JSONB;`);
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS alternatives JSONB;`);
    console.log('[migrations] Catalog reset: truncated + columns ensured');
    return res.json({ success: true, message: 'Catalog truncated and schema updated' });
  } catch (err) {
    console.error('[migrations] RESET ERROR:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/status ─────────────────────────────────────────────────────────
// Health and version status for deployment verification
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.7.0',
    time: new Date().toISOString()
  });
});

// ── UNIFIED SEARCH ──────────────────────────────────────────────────────────

// ─── GET /api/catalog/export ──────────────────────────────────────────────────
app.get('/api/catalog/export', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT sku, codigo_base, description, filter_type, sub_type, technology,
             installation_type, thread_size,
             outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency,
             burst_pressure_psi, collapse_pressure_psi, duty
      FROM elimfilters_catalog
      ORDER BY filter_type, sku
    `);
    const cols = result.fields.map(f => f.name);
    const escape = v => v == null ? '' : (String(v).includes(',') || String(v).includes('"') || String(v).includes('\n'))
      ? '"' + String(v).replace(/"/g, '""') + '"'
      : String(v);
    const lines = [cols.join(','), ...result.rows.map(r => cols.map(c => escape(r[c])).join(','))];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="elimfilters_catalog.csv"');
    res.send(lines.join('\r\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim().toUpperCase();
  if (q.length < 2) return res.status(400).json({ error: 'min 2 chars', products: [] });
  const lang = detectLang(req);
  const client = new Client(dbConfig);
  try {
    await client.connect();

    // ── Tiered search with match_type labels ──────────────────────────────
    // Tier 1: Exact SKU or Donaldson base code match
    let result = await client.query(
      `SELECT *, 'sku' AS match_type, 0 AS match_rank
       FROM elimfilters_catalog
       WHERE UPPER(sku) = $1 OR UPPER(codigo_base) = $1
       LIMIT 20`,
      [q]
    );

    // Tier 2: Prefix match on SKU / codigo_base
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT *, 'sku_prefix' AS match_type, 1 AS match_rank
         FROM elimfilters_catalog
         WHERE UPPER(sku) LIKE $1 OR UPPER(codigo_base) LIKE $1
         ORDER BY sku
         LIMIT 20`,
        [q + '%']
      );
    }

    // Tier 3+4 combined: OEM + competitor codes — EXACT match only.
    // Cross-reference codes must match precisely; prefix matching causes false positives
    // (e.g. searching "B76" must not return products with "B76-MPG" or "B7600").
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT *, 'ref' AS match_type, 2 AS match_rank
         FROM elimfilters_catalog
         WHERE EXISTS (
           SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS elem
           WHERE UPPER(elem->>'code') = $1
         )
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb)) AS elem
           WHERE UPPER(elem->>'code') = $1
         )
         ORDER BY sku
         LIMIT 20`,
        [q]
      );
    }

    // Tier 5: brand_crossrefs — exact match only
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT DISTINCT ON (sku) *, 'crossref' AS match_type, 4 AS match_rank
         FROM elimfilters_catalog,
              jsonb_each(COALESCE(brand_crossrefs, '{}'::jsonb)) AS kv,
              jsonb_array_elements_text(kv.value) AS code_val
         WHERE UPPER(code_val) = $1
         ORDER BY sku
         LIMIT 20`,
        [q]
      );
    }

    // Tier 6: Broad partial match fallback (OEM + competitor text scan)
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT DISTINCT ON (sku) *,
                CASE
                  WHEN UPPER(sku) LIKE $1 OR UPPER(codigo_base) LIKE $1 THEN 'sku_partial'
                  ELSE 'partial'
                END AS match_type,
                5 AS match_rank
         FROM elimfilters_catalog,
              jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS oem_elem
         WHERE UPPER(sku) LIKE $1
            OR UPPER(codigo_base) LIKE $1
            OR UPPER(oem_elem->>'code') LIKE $1
         ORDER BY sku
         LIMIT 20`,
        ['%' + q + '%']
      );
    }

    // ── Determine human-readable match label for the frontend ─────────────
    function buildMatchLabel(row) {
      const mt = row.match_type;
      if (mt === 'sku' || mt === 'sku_prefix' || mt === 'sku_partial') {
        if (row.sku && row.sku.toUpperCase().includes(q)) return `ELIMFILTERS ${row.sku}`;
        if (row.codigo_base && row.codigo_base.toUpperCase().includes(q)) return `DONALDSON ${row.codigo_base}`;
        return null;
      }
      if (mt === 'oem' || mt === 'ref') {
        // Check OEM codes first, then competitor codes
        const oems = row.oem_codes || [];
        const oemHit = oems.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (oemHit) return `${oemHit.manufacturer || 'OEM'} ${oemHit.code}`;
        const comps = row.competitor_codes || [];
        const compHit = comps.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (compHit) return `${compHit.manufacturer || 'COMPETITOR'} ${compHit.code}`;
        return null;
      }
      if (mt === 'competitor') {
        const comps = row.competitor_codes || [];
        const hit = comps.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (hit) return `${hit.manufacturer || 'COMPETITOR'} ${hit.code}`;
        return null;
      }
      if (mt === 'crossref') {
        return `CROSS-REFERENCE ${q}`;
      }
      return null;
    }

    const products = result.rows.map(row => ({
      ...buildFilterData(row, lang),
      sku: row.sku,
      match_type: row.match_type || 'partial',
      match_label: buildMatchLabel(row)
    }));

    res.json({ products, count: products.length, total_catalog: 4622 });
  } catch (e) {
    console.error('[api/search]', e.message);
    res.status(500).json({ error: e.message, products: [] });
  } finally {
    await client.end();
  }
});

app.get('/api/stats', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const r = await client.query(
      `SELECT COUNT(*) AS total, COUNT(DISTINCT technology) AS technologies
       FROM elimfilters_catalog`
    );
    res.json({
      total: parseInt(r.rows[0].total) || 0,
      technologies: parseInt(r.rows[0].technologies) || 0,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('[api/stats]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    await client.end();
  }
});
// ────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
console.log(`[server] Starting on PORT=${PORT} (env PORT=${process.env.PORT || 'not set'})`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);
});