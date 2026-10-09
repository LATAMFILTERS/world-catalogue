'use strict';
const matrix=require('../config/vehicle-platform-closure/john-deere-z900-model-filter-matrix-2026.json');
const normalize=value=>String(value||'').trim().replace(/\s+/g,' ').toUpperCase();
const knownModels=new Map(matrix.models.map(r=>[normalize(r.model),r.model]));
function resolveZ900ModelRequest(message){
 const text=String(message||'').trim().replace(/^¿\s*/,'');
 const match=text.match(/^what\s+filters\s+does\s+(.+?)\s+take[?.!]*$/i)||text.match(/^qu[eé]\s+filtros\s+(?:lleva|usa|necesita)\s+(.+?)[?.!]*$/i);
 if(!match)return null;
 const candidate=normalize(match[1].replace(/^john\s+deere\s+/i,''));
 const model=knownModels.get(candidate);
 if(!model)return null;
 return {brand:'JOHN DEERE',model,engine:null,year:null,tokens:['JOHN DEERE',model],vehicleContext:null,authority_scope:'MODEL_IDENTITY_ONLY'};
}
module.exports={resolveZ900ModelRequest};
