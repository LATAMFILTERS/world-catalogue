export const CANONICAL_TECHNOLOGIES={
macrocore:{slug:'macrocore',name:'MACROCORE™',domain:'air-intake',role:'Engine air filtration'},
microkappa:{slug:'microkappa',name:'MICROKAPPA™',domain:'air-intake',role:'Cabin air filtration'},
drycore:{slug:'drycore',name:'DRYCORE™',domain:'air-intake',role:'Air-dryer filtration'},
intekcore:{slug:'intekcore',name:'INTEKCORE™',domain:'air-intake',role:'Air housings and sealing'},
syntrax:{slug:'syntrax',name:'SYNTRAX™',domain:'lubrication',role:'Lube and oil filtration'},
nanoforce:{slug:'nanoforce',name:'NANOFORCE™',domain:'hydraulic',role:'Hydraulic filtration'},
syntapore:{slug:'syntapore',name:'SYNTAPORE™',domain:'fuel-cleanliness',role:'Primary and secondary diesel fuel filtration for spin-on and cartridge elements'},
turbocor:{slug:'turbocor',name:'TURBOCOR™',domain:'fuel-cleanliness',role:'FH and FG turbine fuel-water separation systems and replacement elements'},
thermacore:{slug:'thermacore',name:'THERMACORE™',domain:'cooling-system',role:'Cooling-system protection'},
marineclean:{slug:'marineclean',name:'MARINECLEAN™',domain:'marine',role:'Marine filtration architecture'},
duractech:{slug:'duractech',name:'DURACTECH™',domain:'severe-duty',role:'Severe-duty filtration kit architecture'}
} as const;
export type TechnologySlug=keyof typeof CANONICAL_TECHNOLOGIES;
export type CanonicalTechnology=(typeof CANONICAL_TECHNOLOGIES)[TechnologySlug];
export const CANONICAL_TECHNOLOGY_LIST=Object.values(CANONICAL_TECHNOLOGIES);
export function isCanonicalTechnology(value:string):value is TechnologySlug{return value in CANONICAL_TECHNOLOGIES;}
export function getCanonicalTechnology(slug:string):CanonicalTechnology|undefined{return isCanonicalTechnology(slug)?CANONICAL_TECHNOLOGIES[slug]:undefined;}
