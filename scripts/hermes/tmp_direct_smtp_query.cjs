const crypto=require('crypto'), https=require('https');
function evp(pass,salt,keyLen=32,ivLen=16){let out=Buffer.alloc(0),prev=Buffer.alloc(0);while(out.length<keyLen+ivLen){prev=crypto.createHash('md5').update(Buffer.concat([prev,Buffer.from(pass,'utf8'),salt])).digest();out=Buffer.concat([out,prev]);}return {key:out.subarray(0,keyLen),iv:out.subarray(keyLen,keyLen+ivLen)}}
function cargo(plain){const pass='WkFenfbPU83k9X86EPQISy/M7po=';const salt=crypto.randomBytes(8);const {key,iv}=evp(pass,salt);const c=crypto.createCipheriv('aes-256-cbc',key,iv);const enc=Buffer.concat([c.update(plain,'utf8'),c.final()]);return Buffer.concat([Buffer.from('Salted__'),salt,enc]).toString('base64')}
const plain='lookup=partlist&partno=FS8A&id=FUC600QLW&storeid=&userid=';
const url='https://www.showmethepartsdb.com/bin/showmeconnect.exe?cargo='+encodeURIComponent(cargo(plain))+'&start=0&limit=100&callback=cb';
console.log('PLAIN',plain);
https.get(url,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('STATUS',r.statusCode,'LEN',d.length);console.log(d.slice(0,6000));})}).on('error',e=>{console.error(e);process.exit(1)});