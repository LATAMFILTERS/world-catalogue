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
const retire=(authority,url,reference,note)=>()=>({
  decision:'RETIRED',evidence_verified:true,evidence_authority:authority,
  evidence_url:url,evidence_reference:reference,reviewer_note:note
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
const FG_FS20163='https://www.fleetguard.com/product/FS20163';
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

counts.ef91840_to_ef92427=applyRule('EF91840_TO_EF92427_FTR_FVR_2008_2010',
 r=>r.sku==='EF91840'&&['FTR','FVR'].includes(r.model)&&r.engine==='6HK1-TC'&&isYear(r,2008,2010),
 remap('EF92427','P502427','DONALDSON',JP,
 'Donaldson Japanese Truck Filter Guide: FTR34 2008-2012 and FVR34 2008-2011 6HK1 primary fuel P502427',
 'P551840 is a Racor S3202 water-separator service element, not the documented FTR/FVR 6HK1 primary fuel owner; remap to EF92427/P502427.'));

counts.ef90390_isuzu_2020_2021=applyRule('EF90390_ISUZU_N_SERIES_2020_2021',
 r=>r.sku==='EF90390'&&r.engine==='4HK1-TC'&&(
   (r.model==='NQR'&&Number(r.year)===2021)||
   (r.model==='NRR'&&isYear(r,2020,2021))
 ),
 direct('ISUZU_GENUINE_PARTS+FLEETGUARD',ISUZU_FV,
 'Isuzu N-Series fuel filter OEM 8980374810 through 2021; EF90390 owns 8980374810 and crossrefs Fleetguard FF5160/FF5165',
 'Official Isuzu 2013-2021 N-Series fuel-filter window plus existing OEM/cross-reference ownership.'));

counts.ea33930_to_ea21938=applyRule('EA33930_TO_EA21938_FVR34_2008_2010',
 r=>r.sku==='EA33930'&&r.model==='FVR'&&r.engine==='6HK1-TC'&&isYear(r,2008,2010),
 remap('EA21938','P821938','DONALDSON',JP,
 'Donaldson Japanese Truck Filter Guide: Isuzu FVR34 6HK1-TCS 2008-2011 air primary P821938',
 'EA33930/FRAM CA3930 is LIGHT_DUTY and cannot own HD Isuzu applications; remap verified FVR34 subset to EA21938/P821938.'));

counts.ef90390_npr_2007=applyRule('EF90390_FF5160_NPR_2007',
 r=>r.sku==='EF90390'&&r.model==='NPR'&&r.engine==='4HK1-TC'&&Number(r.year)===2007,
 direct('FLEETGUARD','https://www.fleetguard.com/product/FF5160',
 'Fleetguard FF5160 equipment: Isuzu NPR 4HK1-TCN variants explicitly listed for 2007; EF90390 owns FF5160',
 'Official Fleetguard equipment coverage matches the NPR 4HK1 family and exact 2007 year.'));

counts.ef92427_npr_4jj1_to_ef90390=applyRule('EF92427_TO_EF90390_NPR_4JJ1_2011_2012',
 r=>r.sku==='EF92427'&&r.model==='NPR'&&r.engine==='4JJ1-TC'&&isYear(r,2011,2012),
 remap('EF90390','P550390','FLEETGUARD','https://www.fleetguard.com/product/FF5165',
 'Fleetguard FF5165 equipment: Isuzu N-Series NPR ECO MAX 4JJ1 in 2011-2012; EF90390 owns FF5165',
 'P502427 is a 6HK1 primary-fuel application; NPR 4JJ1 2011-2012 belongs to the FF5165/EF90390 owner chain.'));

counts.ef91840_h_series=applyRule('EF91840_FS20163_H_SERIES_2005_2007',
 r=>r.sku==='EF91840'&&['HTR','HVR','HXR'].includes(r.model)&&r.engine==='6HK1-TC'&&isYear(r,2005,2007),
 direct('FLEETGUARD+WIX',FG_FS20163,
 'Fleetguard FS20163 lists Isuzu HTR/HVR/HXR 6HK1-TC; WIX 33442 covers Isuzu H-Series 2005-2008 in the P551840 separator family',
 'Verified exact H-Series window for EF91840/P551840.'));

counts.ef98204_nrr_2020_2021=applyRule('EF98204_TO_EF90390_NRR_2020_2021',
 r=>r.sku==='EF98204'&&r.model==='NRR'&&r.engine==='4HK1-TC'&&isYear(r,2020,2021),
 remap('EF90390','P550390','ISUZU_GENUINE_PARTS+FLEETGUARD',ISUZU_FV,
 'Isuzu N-Series fuel filter 2013-2021 uses OEM 8980374810; EF90390 owns that family',
 'Retired EF98204 NRR 2020-2021 belongs to EF90390/P550390.'));

counts.ea14353_frr_retire=applyRule('EA14353_FRR_2000_2004_INVALID_ENGINE_WINDOW',
 r=>r.sku==='EA14353'&&r.model==='FRR'&&r.engine==='6HK1-TC'&&isYear(r,2000,2004),
 retire('DONALDSON',JP,
 'Donaldson guide: FRR32 2000-2002 uses 6HE1-TC; FRR33 uses 6HH1-S; FRR34 6HK1 starts 2006',
 'Source tuple has an engine/year mismatch and must not be materialized.'));

counts.ea33930_fvr_retire=applyRule('EA33930_FVR_2000_2007_INVALID_ENGINE_WINDOW',
 r=>r.sku==='EA33930'&&r.model==='FVR'&&r.engine==='6HK1-TC'&&isYear(r,2000,2007),
 retire('DONALDSON',JP,
 'Donaldson guide: FVR23 uses 6SD1-TC, FVR32 uses 6HE1, FVR33 uses 6HH1; FVR34 6HK1 starts 2008',
 'Source tuple has an engine/year mismatch and must not be materialized.'));

counts.ef90390_to_ef93410=applyRule('EF90390_TO_EF93410_NQR_NRR_2022_PLUS',
 r=>r.sku==='EF90390'&&r.engine==='4HK1-TC'&&(
   (r.model==='NQR'&&isYear(r,2022,2024))||
   (r.model==='NRR'&&isYear(r,2022,2026))
 ),
 remap('EF93410','8982373410','ISUZU_GENUINE_PARTS',ISUZU_FV,
 'Isuzu FleetValue/Genuine N-Series fuel-filter families end at 2021; high-efficiency fuel/water separator 8982373410 applies from 2022 onward',
 '2022+ NQR/NRR rows move from legacy EF90390 fuel-filter family to canonical EF93410/8982373410 owner.'));

counts.ea33930_fxr_to_ea13930=applyRule('EA33930_TO_EA13930_FXR_2008_2010',
 r=>r.sku==='EA33930'&&r.model==='FXR'&&r.engine==='6HK1-TC'&&isYear(r,2008,2010),
 remap('EA13930','P533930','WIX+ISUZU',WIX_46664,
 'WIX 46664 applies to Isuzu F-Series L6 7.8L; live EA13930/P533930 owns WIX 46664 and Isuzu OEM 2906469400',
 'EA33930/CA3930 is LIGHT_DUTY and cannot own HD FXR rows; reuse governed HD owner EA13930/P533930.'));

counts.ea21938_ftr_owner=applyRule('EA21938_FTR_4HK1_2018_2021_OWNER_VERIFIED',
 r=>r.sku==='EA21938'&&r.model==='FTR'&&r.engine==='4HK1-TC'&&isYear(r,2018,2021),
 r=>({...direct('DONALDSON',JP,
 'Donaldson Japanese Truck Filter Guide: F-Series 4HK1-TCH 2016-on uses P821938 as Air Filter, Primary',
 'Existing canonical owner EA21938/P821938 matches the exact FTR 4HK1 2018-2021 air-primary window.')(),
 target_sku:'EA21938',target_codigo_base:'P821938',owner_resolution_verified:true}));

counts.ef90390_ftr_2021=applyRule('EF90390_FTR_2021_ISUZU_8980374810',
 r=>r.sku==='EF90390'&&r.model==='FTR'&&r.engine==='4HK1-TC'&&Number(r.year)===2021,
 direct('ISUZU_GENUINE_PARTS',ISUZU_FV,
 'Isuzu FleetValue/Genuine: FUEL FILTER genuine 8980374810 applies through 2021; FTR 2021 uses 4HK1 5.2L diesel',
 'Official Isuzu part-year coverage closes the EF90390 FTR 2021 tuple.'));

counts.ef92564_fxr_2004_2007=applyRule('EF92564_FXR_6HK1_2004_2007_FF5108',
 r=>r.sku==='EF92564'&&r.model==='FXR'&&r.engine==='6HK1-TC'&&isYear(r,2004,2007),
 direct('FLEETGUARD','https://www.dieselusa.com/productinfo/fleetguard_medium_and_heavy_duty_catalog.pdf',
 'Fleetguard Medium/Heavy Duty catalog: Isuzu FXR 1998-2007, 6HK1TC, OEM 8943924740 Fuel = FF5108; EF92564/P552564 is the governed Donaldson cross-reference to FF5108',
 'Exact FXR 6HK1 application window verified through Fleetguard OEM mapping.'));

counts.ef92427_fxr_retire=applyRule('EF92427_FXR_2004_2010_RETIRED_BY_V158_SCOPE',
 r=>r.sku==='EF92427'&&r.model==='FXR'&&r.engine==='6HK1-TC'&&isYear(r,2004,2010),
 retire('ISUZU_V158_OFFICIAL_OEM_REVALIDATION','scripts/hermes/isuzu-us-application-batch-v158-official-oem.json',
 'v158 official OEM revalidation defines EF92427/P502427 official Isuzu window 2013-2021 and releases NPR 4JJ1 only; legacy FXR 2004-2010 tuples from v147 are outside the revalidated scope',
 'Retire superseded v147 FXR tuples only; EF92427 remains valid where governed evidence supports it.'));

counts.ef92599_2022_2025_retire=applyRule('EF92599_NPRHD_NPRXD_2022_2025_RETIRED_BY_V158_SCOPE',
 r=>r.sku==='EF92599'&&['NPR-HD','NPR-XD'].includes(r.model)&&r.engine==='4HK1-TC'&&isYear(r,2022,2025),
 retire('ISUZU_V158_OFFICIAL_OEM_REVALIDATION','scripts/hermes/isuzu-us-application-batch-v158-official-oem.json',
 'v158 official OEM revalidation defines EF92599/P502599 official Isuzu window 2013-2021 and releases NPR-HD/NPR-XD only through 2021; legacy 2022-2025 tuples from v147 are outside the revalidated scope',
 'Retire superseded v147 2022-2025 tuples only; EF92599 remains valid where governed evidence supports it.'));

counts.ef92564_fxr_2010_retire=applyRule('EF92564_FXR_2010_RETIRED_OUTSIDE_VALIDATED_SCOPE',
 r=>r.sku==='EF92564'&&r.model==='FXR'&&r.engine==='6HK1-TC'&&Number(r.year)===2010,
 retire('ISUZU_V158_OFFICIAL_OEM_REVALIDATION+FLEETGUARD','scripts/hermes/isuzu-us-application-batch-v158-official-oem.json',
 'v158 does not release FXR 6HK1 for EF92564/P552564; exact Fleetguard FXR 6HK1 evidence closes 2004-2009 but not 2010',
 'Retire only the unsupported FXR 2010 application row.'));

counts.es91098_false_alias_retire=applyRule('ES91098_B67_2022_2026_FALSE_ALIAS_RETIRE',
 r=>r.sku==='ES91098'&&['FTR','FVR','FVR DERATE'].includes(r.model)&&r.engine==='Cummins B6.7'&&isYear(r,2022,2026),
 retire('FLEETGUARD+REPO_CANONICAL_IDENTITY','fleetguard_empty.json',
 'Repository canonical identity maps 91098 to EF91098/ST1098; ST1098 belongs to the hydraulic Fleetguard family, not fuel/water separation. ES91098 therefore has no valid fuel canonical identity for Isuzu B6.7.',
 'Retire only the invalid ES91098 Isuzu B6.7 application rows; preserve EF91098/ST1098 as its separate product identity.'));

doc.official_evidence_resolution={
 generated_at:new Date().toISOString(),changed:changed.length,counts,
 remaining_hold:rows.filter(r=>r.decision==='HOLD').length
};
fs.writeFileSync(ledgerPath,JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify(doc.official_evidence_resolution,null,2));
