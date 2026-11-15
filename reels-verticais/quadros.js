// Folha de quadros de um Reel vertical (o beats.js do motion-broll usa tela 16:9).
// uso: node quadros.js pagina.html folha.png t1 t2 ...
const {chromium}=require('playwright');const path=require('path');const os=require('os');const fs=require('fs');const {execFileSync}=require('child_process');
(async()=>{const [html,out,...ts]=process.argv.slice(2);
 if(!html||!out||!ts.length){console.error('uso: node quadros.js pagina.html folha.png t1 [t2 ...]');process.exit(2);}
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(html)+'?render');await p.evaluate(()=>document.fonts.ready);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'quadros-'));
 try{for(let i=0;i<ts.length;i++){await p.evaluate(t=>seek(t),+ts[i]);await p.screenshot({path:path.join(dir,`${String(i).padStart(3,'0')}.png`)});}
  await b.close();const cols=Math.min(6,ts.length),rows=Math.ceil(ts.length/cols);
  execFileSync('ffmpeg',['-loglevel','error','-y','-i',path.join(dir,'%03d.png'),'-vf',`scale=360:-1,tile=${cols}x${rows}:padding=4:color=white`,'-frames:v','1',out],{stdio:'inherit'});
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
 if(errs.length){console.error('ERRO',errs);process.exit(1);}})().catch(e=>{console.error(e);process.exit(1);});
