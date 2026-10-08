'use strict';

function sslConfigFor(connectionString){
  try{
    const url=new URL(connectionString);
    const host=String(url.hostname||'').toLowerCase();
    if(host==='localhost'||host==='127.0.0.1'||host==='::1') return undefined;
    return {rejectUnauthorized:false};
  }catch{
    return {rejectUnauthorized:false};
  }
}

module.exports={sslConfigFor};
