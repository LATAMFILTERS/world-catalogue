'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const CASES = [
  {
    source:'EL32001', target:'EH61207', code:'WH12001',
    target_base:'P176207', filter_type:'hydraulic', duty:'HEAVY_DUTY',
    expected_rows:52, technology:null, create_target:false,
    competitor_brand:'MANN-FILTER'
  },
  {
    source:'EL32005', target:'EH61949', code:'WH12005',
    target_base:'P170949', filter_type:'hydraulic', duty:'HEAVY_DUTY',
    expected_rows:155, technology:null, create_target:false,
    competitor_brand:'MANN-FILTER'
  },
  {
    source:'EL30925', target:'EF90810', code:'WDK925',
    target_base:'P550810', filter_type:'fuel', duty:'HEAVY_DUTY',
    expected_rows:10, technology:'SYNTAPORE™', create_target:true,
    competitor_brand:'MANN-FILTER'
  }
];

async function main(){
  const url=process.env.CATALOG_DATABASE_URL
    || process.env.ELIMFILTERS_DATABASE_URL
    || process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const report={
    mode:EXECUTE?'execute':'dry-run',
    authorities:[],
    mutations:{
      catalog_rows_inserted:0,
      ld_parent_rows_inserted:0,
      competitor_rows_inserted:0,
      oem_rows_inserted:0,
      application_rows_reowned:0
    }
  };

  try{
    for(const item of CASES){
      let target=(await db.query(
        `SELECT sku,codigo_base,canonical_source_code,filter_type,duty,technology,catalog_active
           FROM public.elimfilters_catalog
          WHERE sku=$1`,
        [item.target]
      )).rows[0];

      if(!target && !item.create_target){
        throw new Error(`target missing: ${item.target}`);
      }

      if(!target && item.create_target){
        const duplicate=await db.query(
          `SELECT sku,codigo_base,canonical_source_code
             FROM public.elimfilters_catalog
            WHERE ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($1)
               OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($1)`,
          [item.target_base]
        );
        if(duplicate.rowCount){
          throw new Error(`${item.target_base} already owned by ${JSON.stringify(duplicate.rows)}`);
        }

        if(EXECUTE){
          const ins=await db.query(
            `INSERT INTO public.elimfilters_catalog
              (sku,codigo_base,filter_type,technology,duty,
               canonical_source_brand,canonical_source_code,canonical_source_url,
               canonical_source_status,canonical_verified_at,canonical_evidence,
               duty_source_brand,duty_source_url,duty_validation_status,duty_verified_at,duty_evidence,
               vehicle_applications,equipment_applications,
               oem_codes,competitor_codes,catalog_active,catalog_scope_reason,catalog_scope_verified_at)
             VALUES
              ($1::text,$2::text,$3::text,$4::text,$5::text,
               'DONALDSON'::text,$2::text,$6::text,
               'VERIFIED'::text,now(),$7::jsonb,
               'DONALDSON'::text,$6::text,'VERIFIED'::text,now(),$8::jsonb,
               '[]'::jsonb,'[]'::jsonb,
               '[]'::jsonb,'[]'::jsonb,true,'B3.1_CANONICAL_IDENTITY_RECONSTRUCTION',now())
             RETURNING sku`,
            [
              item.target,item.target_base,item.filter_type,item.technology,item.duty,
              'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/industries-markets/truck-bus/emea/f116002/Truck-Bus-Catalogue.pdf',
              JSON.stringify({
                phase:'B3.1',
                authority:'DONALDSON',
                cross_reference:'1345335',
                product_family:'FUEL FILTER, SPIN-ON',
                technology_rule:'DONALDSON_FUEL_EF9_SYNTAPORE'
              }),
              JSON.stringify({
                phase:'B3.1',
                authority:'DONALDSON_TRUCK_BUS_CATALOGUE',
                evidence:'1345335 -> P550810'
              })
            ]
          );
          report.mutations.catalog_rows_inserted+=ins.rowCount;
        }

        target={
          sku:item.target,codigo_base:item.target_base,
          canonical_source_code:item.target_base,
          filter_type:item.filter_type,duty:item.duty,
          technology:item.technology,catalog_active:true
        };
      }

      if(norm(target.codigo_base)!==norm(item.target_base)
        || String(target.filter_type||'')!==item.filter_type
        || String(target.duty||'')!==item.duty
        || target.catalog_active!==true){
        throw new Error(`target identity mismatch ${item.target}: ${JSON.stringify(target)}`);
      }

      const parent=await db.query(
        `SELECT elimfilters_sku,source_sku,segment
           FROM ld_catalog.ld_product_catalog
          WHERE elimfilters_sku=$1`,
        [item.target]
      );
      const otherParent=await db.query(
        `SELECT elimfilters_sku,source_sku
           FROM ld_catalog.ld_product_catalog
          WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($1)
            AND elimfilters_sku<>$2`,
        [item.target_base,item.target]
      );
      if(otherParent.rowCount){
        throw new Error(`parent source ${item.target_base} already owned by ${JSON.stringify(otherParent.rows)}`);
      }
      if(parent.rowCount && norm(parent.rows[0].source_sku)!==norm(item.target_base)){
        throw new Error(`parent mismatch for ${item.target}: ${JSON.stringify(parent.rows)}`);
      }

      const rows=await db.query(
        `SELECT id,make,model_family,model_type,year,engine_code
           FROM ld_catalog.ld_vehicle_applications
          WHERE elimfilters_sku=$1
            AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
          ORDER BY id`,
        [item.source,item.code]
      );
      if(rows.rowCount!==item.expected_rows){
        throw new Error(`${item.code} rows ${rows.rowCount} != ${item.expected_rows}`);
      }

      const collisions=await db.query(
        `SELECT count(*)::int AS n
           FROM ld_catalog.ld_vehicle_applications s
          WHERE s.elimfilters_sku=$1
            AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
            AND EXISTS(
              SELECT 1
                FROM ld_catalog.ld_vehicle_applications t
               WHERE t.elimfilters_sku=$3
                 AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
                 AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
                 AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
                 AND coalesce(t.year,'')=coalesce(s.year,'')
                 AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
            )`,
        [item.source,item.code,item.target]
      );
      if(collisions.rows[0].n!==0){
        throw new Error(`${item.code} target collisions: ${collisions.rows[0].n}`);
      }

      report.authorities.push({
        code:item.code,source:item.source,target:item.target,
        target_base:item.target_base,rows:rows.rowCount,
        collisions:collisions.rows[0].n,
        parent_exists:parent.rowCount===1,
        create_target:item.create_target && !target
      });

      if(EXECUTE){
        if(parent.rowCount===0){
          const insParent=await db.query(
            `INSERT INTO ld_catalog.ld_product_catalog
              (elimfilters_sku,source_sku,segment)
             VALUES ($1,$2,$3)
             ON CONFLICT (elimfilters_sku) DO NOTHING
             RETURNING elimfilters_sku`,
            [item.target,item.target_base,
             item.filter_type==='hydraulic'?'Hydraulic Filter':'Fuel Filter']
          );
          if(insParent.rowCount!==1) throw new Error(`parent insert failed: ${item.target}`);
          report.mutations.ld_parent_rows_inserted+=insParent.rowCount;
        }

        const xref=await db.query(
          `INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
           SELECT $1::text,$2::text,$3::text,$4::text
           WHERE NOT EXISTS(
             SELECT 1 FROM ld_catalog.ld_competitor_cross_references x
              WHERE x.elimfilters_sku=$1::text
                AND upper(coalesce(x.competitor_brand,''))=upper($3::text)
                AND ld_catalog.norm_part(x.competitor_part_number)=ld_catalog.norm_part($4::text)
           )
           RETURNING id`,
          [item.target,item.target_base,item.competitor_brand,item.code]
        );
        report.mutations.competitor_rows_inserted+=xref.rowCount;

        if(item.code==='WDK925'){
          const oem=await db.query(
            `INSERT INTO ld_catalog.ld_oem_cross_references
              (elimfilters_sku,source_sku,oem_brand,oem_part_number)
             SELECT $1::text,$2::text,'DAF'::text,'1345335'::text
             WHERE NOT EXISTS(
               SELECT 1 FROM ld_catalog.ld_oem_cross_references x
                WHERE x.elimfilters_sku=$1::text
                  AND upper(coalesce(x.oem_brand,''))='DAF'
                  AND ld_catalog.norm_part(x.oem_part_number)=ld_catalog.norm_part('1345335')
             )
             RETURNING id`,
            [item.target,item.target_base]
          );
          report.mutations.oem_rows_inserted+=oem.rowCount;
        }

        const updated=await db.query(
          `UPDATE ld_catalog.ld_vehicle_applications
              SET elimfilters_sku=$1
            WHERE id=ANY($2::int[])
              AND elimfilters_sku=$3
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)`,
          [item.target,rows.rows.map(r=>r.id),item.source,item.code]
        );
        if(updated.rowCount!==item.expected_rows){
          throw new Error(`${item.code} updated ${updated.rowCount} != ${item.expected_rows}`);
        }
        report.mutations.application_rows_reowned+=updated.rowCount;
      }
    }

    if(EXECUTE){
      await db.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    }else{
      await db.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  }catch(error){
    try{await db.query('ROLLBACK');}catch{}
    throw error;
  }finally{
    await db.end();
  }
}

main().catch(error=>{
  console.error(error.stack||error.message);
  process.exit(1);
});
