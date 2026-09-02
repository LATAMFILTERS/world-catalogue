import type { Metadata } from 'next';
import ClientNav from './ClientNav';

const BASE='https://elimfilters.com';
const URL=`${BASE}/knowledge-center/`;
const TITLE='Industrial Filtration Knowledge Center | ELIMFILTERS';
const DESCRIPTION='Engineering knowledge for industrial filtration, contamination control, standards, failure diagnosis, equipment reliability, fleet maintenance and asset protection.';
const IMAGE=`${BASE}/images/mecanica-air.avif`;

export const metadata:Metadata={
 title:TITLE,
 description:DESCRIPTION,
 keywords:['industrial filtration knowledge','filtration engineering','contamination control','filtration standards','failure diagnosis','equipment reliability','fleet maintenance','asset protection systems','technical filtration FAQ','filtration technologies','air intake filtration','fuel filtration','lubrication filtration','hydraulic filtration','cooling system filtration'],
 robots:{index:true,follow:true},
 alternates:{canonical:URL},
 openGraph:{title:TITLE,description:DESCRIPTION,url:URL,type:'website',siteName:'ELIMFILTERS',locale:'en_US',images:[{url:IMAGE,width:1200,height:630,alt:'ELIMFILTERS industrial filtration Knowledge Center'}]},
 twitter:{card:'summary_large_image',title:TITLE,description:DESCRIPTION,images:[IMAGE]},
};

const parts=[
 ['Industrial Standards','standards'],['Contamination & Failure Modes','problems'],['Protection Technologies','technologies'],['Asset Protection Systems','systems'],['Fleet Optimization','fleet-optimization'],['Technical Glossary','glossary'],['Technical FAQ','faq'],['Knowledge Search','search']
].map(([name,slug])=>({'@type':'CollectionPage','@id':`${URL}${slug}/#collection`,url:`${URL}${slug}/`,name}));

const collectionSchema={
 '@context':'https://schema.org','@type':'CollectionPage','@id':`${URL}#collection`,url:URL,name:'ELIMFILTERS Technical Knowledge Center',headline:'Engineering knowledge for better asset decisions',description:DESCRIPTION,
 isPartOf:{'@type':'WebSite','@id':`${BASE}/#website`,name:'ELIMFILTERS',url:`${BASE}/`},publisher:{'@type':'Organization','@id':`${BASE}/#organization`,name:'ELIMFILTERS'},
 about:['Industrial filtration','Contamination control','Filtration standards and test methods','Asset protection systems','Equipment reliability','Fleet maintenance','Failure diagnosis','Filtration technology architecture'].map(name=>({'@type':'Thing',name})),
 mentions:['Air intake filtration','Fuel cleanliness','Lubrication protection','Hydraulic cleanliness','Cooling system protection','Pneumatic brake-system air protection','Particle contamination','Water contamination','Restriction','Bypass prevention'].map(name=>({'@type':'Thing',name})),
 hasPart:parts,
 potentialAction:{'@type':'SearchAction',target:{'@type':'EntryPoint',urlTemplate:`${URL}search/?q={search_term_string}`},'query-input':'required name=search_term_string'}
};
const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${BASE}/`},{'@type':'ListItem',position:2,name:'Knowledge Center',item:URL}]};
const itemList={'@context':'https://schema.org','@type':'ItemList','@id':`${URL}#knowledge-domains`,name:'ELIMFILTERS Knowledge Center domains',itemListElement:parts.map((item,index)=>({'@type':'ListItem',position:index+1,item}))};

export default function KnowledgeCenterLayout({children}:{children:React.ReactNode}){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(collectionSchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemList)}}/><ClientNav/>{children}</>}
