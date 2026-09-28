#!/usr/bin/env node
import fs from 'node:fs';

const ledgerPath='hermes/reports/isuzu-v160-decision-ledger.json';
const doc=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
const rows=doc.rows||[];
const changed=[];

const applyRule=(name,predicate,patch)=>{
  let count=0;
  for(const r of rows){
    if(r.decision!=='HOLD'||!predicate(r)) continue;
    Object.assign(r,patch(r));
    r.resolution_origin='ISUZU_V160_OFFICIAL_EVIDENCE';
    r.resolution_rule=name;
    changed.push(r.id);
    count++;
  }
  return count;
};
const direct=(authority,url,reference,note)=>()=>({
  decision:'READY_TO_IMPLEMENT',evidence_verified:true,evidence_authority:authority,
  evidence_url:url,evidence_reference:reference,reviewer_note:note
});
const remap=(target,base,authority,url,reference,note)=>()=>({
  decision:'READY_REMAP',target_sku:target,target_codigo_base:base,evidence_verified:true,
  evidence_authority:authority,evidence_url:url,evidence_reference:reference,reviewer_note:note
});
const isYear=(r,a,b)=>Number(r.year)>=a&&Number(r.year)<=b;
const JP='https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/australasia/industries-markets/f111672-eng/Japanese-Truck-Filter-Guide.pdf';
const B67='https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/engine-liquid/F111289-ENG/Popular-Engine-Fuel-and-Lube-Truck-Filters.pdf';
const FG_LF3970='https://www.fleetguard.com/product/LF3970';
const FG_AF27693='https://www.fleetguard.com/product/AF27693';
const ISUZU_FV='https://www.isuzucv.com/en/app/site/pdf?file=FVGenuineCrossRef.pdf';
const FG_FF5160='https://www.fleetguard.com/product/FF5160';
const FG_FF5165='https://www.fleetguard.com/product/FF5165';
const FG_FF5108='https://www.fleetguard.com/product/FF5108';
const FG_FS20128='https://www.fleetguard.com/product/FS20128';
const FG_FF5877='https://www.fleetguard.com/product/FF5877';
const FG_MK13086='https://www.fleetguard.com/product/MK13086';
const WIX_46664='https://www2.wixfilters.com/Lookup/PartApplications.aspx?Part=46664';

const counts={};
counts.el80606=applyRule('EL80606_TO_EL80428_B67',
 r=>r.sku==='EL80606'&&r.engine==='Cummins B6.7'&&['FTR','FVR','FVR DERATE'].includes(r.model)&&isYear(r,2022,2026),
 remap('EL80428','P550428','ISUZU+DONALDSON+FLEETGUARD',B67,
 'Isuzu F-Series 2022-2026 B6.7; Donaldson B6.7 P550428/LF3970; Fleetguard LF3970 equipment',
 'LF606 is not the B6.7 lube owner; remap exact F-Series B6.7 tuple to EL80428/P550428.'));
counts.el80428=applyRule('EL80428_FVR_DERATE_B67',
 r=>r.sku==='EL80428'&&r.model==='FVR DERATE'&&r.engine==='Cummins B6.7'&&isYear(r,2022,2026),
 direct('ISUZU+DONALDSON+FLEETGUARD',FG_LF3970,
 'Isuzu F-Series 2022-2026 B6.7; Donaldson P550428/LF3970; Fleetguard LF3970',
 'Official Isuzu engine specification plus Donaldson/Fleetguard B6.7 lube evidence.'));
counts.ef93009=applyRule('EF93009_FVR_DERATE_B67',
 r=>r.sku==='EF93009'&&r.model==='FVR DERATE'&&r.engine==='Cummins B6.7'&&isYear(r,2022,2026),
 direct('ISUZU+DONALDSON',B67,
 'Isuzu F-Series 2022-2026 B6.7; Donaldson P553009/FF63054NN B6.7 secondary fuel',
 'Official Isuzu B6.7 engine specification plus Donaldson B6.7 fuel application.'));
counts.el80420=applyRule('EL80420_TO_EL80408_FVR_6HK1',
 r=>r.sku==='EL80420'&&r.model==='FVR'&&r.engine==='6HK1-TC'&&isYear(r,2008,2010),
 remap('EL80408','P550408','DONALDSON',JP,
 'Donaldson Japanese Truck Filter Guide: Isuzu FVR34 6HK1-TCS 2008-2011 lube P550408',
 'P550420 is not the documented FVR34 6HK1 lube owner; remap to EL80408/P550408.'));
counts.ef92427=applyRule('EF92427_FTR_FVR_6HK1',
 r=>r.sku==='EF92427'&&['FTR','FVR'].includes(r.model)&&r.engine==='6HK1-TC'&&isYear(r,2008,2010),
 direct('DONALDSON',JP,
 'Donaldson Japanese Truck Filter Guide: Isuzu FTR34/FVR34 6HK1 2008-2011 fuel primary P502427',
 'Official Donaldson application guide matches model, engine and year.'));
counts.ea13614=applyRule('EA13614_NPR_XD_4HK1_TC',
 r=>r.sku==='EA13614'&&r.model==='NPR-XD'&&r.engine==='4HK1-TC'&&isYear(r,2015,2017),
 direct('FLEETGUARD',FG_AF27693,
 'Fleetguard AF27693: Isuzu NPR-XD 4HK1-TC 5.2L 2015-2017',
 'Official Fleetguard equipment table matches model, engine and year.'));
counts.ea13614_isuzu=applyRule('EA13614_ISUZU_N_SERIES_AIR_2006_PLUS',
 r=>r.sku==='EA13614'&&r.engine==='4HK1-TC'&&['NPR-HD','NPR-XD','NRR DERATE'].includes(r.model)&&Number(r.year)>=2006,
 direct('ISUZU_GENUINE_PARTS',ISUZU_FV,
 'N-Series NPR/NRR/NQR AIR FILTER 2006-: OEM 8970622940/8981772710/29007N0000; 8970622940 maps to EA13614/P543614',
 'Official Isuzu Genuine Parts cross-reference establishes the N-Series air-filter family and live ELIMFILTERS OEM ownership.'));
counts.el88076_isuzu=applyRule('EL88076_ISUZU_N_SERIES_DIESEL_OIL_2011_PLUS',
 r=>r.sku==='EL88076'&&r.engine==='4HK1-TC'&&['NPR-HD','NPR-XD','NQR','NRR'].includes(r.model)&&Number(r.year)>=2011,
 direct('ISUZU_GENUINE_PARTS',ISUZU_FV,
 'N-Series NPR/NRR/NQR diesel OIL FILTER 2011-: OEM 2906544040/8982984040; both map to EL88076/P848076',
 'Official Isuzu Genuine Parts cross-reference establishes the N-Series diesel oil-filter family and live ELIMFILTERS OEM ownership.'));
counts.ef90390_fg=applyRule('EF90390_FF5160_FF5165_EXACT_WINDOWS',
 r=>r.sku==='EF90390'&&(
   (r.model==='FTR'&&r.engine==='4HK1-TC'&&isYear(r,2018,2020))||
   (r.model==='NPR'&&r.engine==='4JJ1-TC'&&isYear(r,2011,2018))||
   (r.model==='NPR-HD'&&r.engine==='4HK1-TC'&&isYear(r,2008,2010))||
   (r.model==='NQR'&&r.engine==='4HK1-TC'&&isYear(r,2008,2010))||
   (r.model==='NRR'&&r.engine==='4HK1-TC'&&isYear(r,2008,2009))
 ),
 direct('FLEETGUARD',FG_FF5160,
 'EF90390 crossrefs FF5160/FF5165; Fleetguard equipment tables explicitly match these Isuzu model/year engine-family tuples',
 'Official Fleetguard equipment coverage matches exact model/year and the 4HK1/4JJ1 engine family.'));
counts.es90128_fg=applyRule('ES90128_FS20128_NPR_2018_2019',
 r=>r.sku==='ES90128'&&['NPR-HD','NPR-XD'].includes(r.model)&&r.engine==='4HK1-TC'&&isYear(r,2018,2019),
 direct('FLEETGUARD+ISUZU',FG_FS20128,
 'Fleetguard FS20128 explicitly lists NPR-HD/NPR-XD 4HK1 for 2018-2019; US Isuzu engine designation is 4HK1-TC',
 'Official Fleetguard equipment table matches model/year; Isuzu documentation supplies the canonical 4HK1-TC designation.'));
counts.ef98204_fs20128=applyRule('EF98204_TO_ES90128_VERIFIED_SUBSET',
 r=>r.sku==='EF98204'&&r.engine==='4HK1-TC'&&(
   (r.model==='NQR'&&Number(r.year)===2022)||
   (r.model==='NRR'&&Number(r.year)===2022)||
   (r.model==='NRR DERATE'&&isYear(r,2025,2026))
 ),
 remap('ES90128','FS20128','FLEETGUARD+ISUZU',FG_FS20128,
 'FS20128 exact NQR/NRR 2022 equipment plus prior v152 verified NRR DERATE 2025-2026 correction',
 'EF98204 is retired; verified subset remaps to canonical HYDROCORE owner ES90128/FS20128.'));
counts.ef92564_fg=applyRule('EF92564_FF5108_FXR_2008_2009',
 r=>r.sku==='EF92564'&&r.model==='FXR'&&r.engine==='6HK1-TC'&&isYear(r,2008,2009),
 direct('FLEETGUARD',FG_FF5108,
 'EF92564 crossref FF5108; Fleetguard lists Isuzu FXR 6HK1 in 2008 and 2009',
 'Official Fleetguard equipment table matches model, engine family and year.'));
counts.ef92599_fg=applyRule('EF92599_FF5877_2010_EXACT',
 r=>r.sku==='EF92599'&&r.engine==='4HK1-TC'&&Number(r.year)===2010&&['NPR-HD','NQR'].includes(r.model),
 direct('FLEETGUARD',FG_FF5877,
 'EF92599 crossref FF5877; Fleetguard lists NPR-HD 4HK1 2010 and NQR 4HK1 2010',
 'Official Fleetguard equipment table matches exact model/year and engine family.'));
counts.ef90390_legacy=applyRule('EF90390_FF5160_FF5165_LEGACY_EXACT',
 r=>r.sku==='EF90390'&&r.engine==='4HK1-TC'&&(
   (r.model==='NPR'&&isYear(r,2008,2009))||
   (r.model==='NRR'&&Number(r.year)===2004)
 ),
 direct('FLEETGUARD',FG_MK13086,
 'EF90390 crossrefs FF5160/FF5165; Fleetguard FF5165 covers N-Series NPR 2008-2009 and MK13086 includes FF5160 for NRR 4HK1 2004',
 'Official Fleetguard equipment tables match exact model/year and product cross-reference chain.'));
counts.ea33655_owner=applyRule('EA33655_TO_EA13930_WIX46664_F_SERIES',
 r=>r.sku==='EA33655'&&r.engine==='Cummins B6.7'&&['FTR','FVR','FVR DERATE'].includes(r.model)&&isYear(r,2022,2026),
 remap('EA13930','P533930','WIX+ISUZU_CROSS',WIX_46664,
 'WIX 46664 official application: Isuzu F SERIES 2021-2026 L6 6.7L; live EA13930 owns WIX 46664, Fleetguard AF25354/AF25359 and Isuzu 8980714230',
 'Reuse existing HD canonical owner EA13930/P533930; do not materialize duplicate EA33655/P533655 equivalent.'));
counts.ef93410_isuzu=applyRule('EF93410_ISUZU_N_SERIES_2022_PLUS',
 r=>r.sku==='EF93410'&&r.engine==='4HK1-TC'&&['NPR-HD','NPR-XD'].includes(r.model)&&Number(r.year)>=2022,
 r=>({...direct('ISUZU_GENUINE_PARTS',ISUZU_FV,
 'Isuzu FleetValue/Genuine cross-reference: FUEL/WATER SEP; HIGH EFF, genuine 8982373410, N-Series diesel 2022 onward',
 'Official Isuzu parts catalog establishes 8982373410 as the 2022+ N-Series high-efficiency fuel/water separator.')(),owner_resolution_verified:true}));
for(const r of rows){if(r.sku==='EF93410'&&r.decision==='READY_TO_IMPLEMENT'&&r.evidence_verified)r.owner_resolution_verified=true;}

counts.ef98204_2022plus=applyRule('EF98204_TO_EF93410_ISUZU_2022_PLUS',
 r=>r.sku==='EF98204'&&r.engine==='4HK1-TC'&&Number(r.year)>=2022&&['NPR-HD','NPR-XD','NQR','NRR','NRR DERATE'].includes(r.model),
 remap('EF93410','8982373410','ISUZU_GENUINE_PARTS',ISUZU_FV,
 'Isuzu FleetValue/Genuine cross-reference: FUEL/WATER SEP; HIGH EFF, genuine 8982373410, N-Series diesel 2022 onward',
 'Retired EF98204 residual 2022+ positions remap to the canonical Isuzu-backed owner EF93410/8982373410.'));

doc.official_evidence_resolution={
 generated_at:new Date().toISOString(),changed:changed.length,counts,
 remaining_hold:rows.filter(r=>r.decision==='HOLD').length
};
fs.writeFileSync(ledgerPath,JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify(doc.official_evidence_resolution,null,2));
