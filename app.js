'use strict';
const el=id=>document.getElementById(id);
const frame=el('native'), origin=location.origin;
const colors=['#efdcaa','#e8bd79','#e59855','#d46a41','#a7413e','#763050'];
const ranges=['1–4','5–10','11–25','26–50','51–100','101+'];
const projectPromise=fetch('schools.geolibre.json').then(r=>{if(!r.ok)throw Error('School project unavailable');return r.json()});
let project,zoom=6.7,ready=false,loaded=false,usingFallback=false,homeZoom;
const center=[80.69,7.91];
function fitZoom(){
  const h=el('map').clientHeight,w=el('map').clientWidth;
  return Math.min(7.15,Math.log2(Math.max(230,h-135)*360/(512*4.25)),Math.log2(Math.max(220,w-70)*360/(512*2.65)));
}
function legend(z){
 const points=z>=11.3;
 el('key-title').textContent=points?'School locations':'Schools per hexagon';
 el('swatches').innerHTML=points?'':ranges.map((v,i)=>'<span class="tick"><i style="background:'+colors[i]+'"></i>'+v+'</span>').join('');
 el('tip').textContent=points?'Select a school for details':'Zoom in to see individual schools';
}
function send(message){frame.contentWindow?.postMessage(message,origin)}
function command(method,params,requestId=method){send({type:'geolibre:command',requestId,method,params})}
async function loadProject(){
 if(!ready||loaded||usingFallback)return;
 loaded=true;project=await projectPromise;
 homeZoom=fitZoom();zoom=homeZoom;project.mapView={center,zoom,bearing:0,pitch:0};
 project.interaction={identify:'all',controls:{search:false,globe:false}};
 send({type:'geolibre:load-project',project,seq:1});
 setTimeout(()=>send({type:'geolibre:request-state'}),800);
}
let confirmed=false;
window.addEventListener('message',event=>{
 if(event.source!==frame.contentWindow||event.origin!==origin||usingFallback)return;
 const m=event.data;
 if(m?.type==='geolibre:result' && m.requestId==='chart-bounds' && m.ok) renderChart(m.value);
 if(m?.type==='geolibre:ready'){ready=true;loadProject()}
 if(m?.type==='geolibre:error'){fallback();return}
 if(m?.type==='geolibre:state'&&m.project?.name==='Schools of Sri Lanka'){
   if(!confirmed){confirmed=true;const strip=frame.contentDocument.createElement('style');strip.textContent='.maplibregl-ctrl-top-right{display:none!important}';frame.contentDocument.head.append(strip);frame.style.opacity='1';el('load').hidden=true}
   zoom=m.project.mapView.zoom;legend(zoom);if(!el('chart').hidden)command('getBounds',{},'chart-bounds');
 }
});
function changeZoom(delta){
 if(usingFallback){window.hexViewer?.changeZoom(delta);return}
 zoom=Math.max(5,Math.min(16,zoom+delta));command('flyTo',{zoom,duration:250});legend(zoom);
}
el('plus').onclick=()=>changeZoom(1);el('minus').onclick=()=>changeZoom(-1);
el('home').onclick=()=>{if(usingFallback){window.hexViewer?.home();return}zoom=fitZoom();command('flyTo',{center,zoom,duration:350});legend(zoom)};
async function fallback(){
 if(usingFallback)return;
 usingFallback=true;frame.hidden=true;frame.removeAttribute('src');
 try{
 const p=await projectPromise;
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/maplibre.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});
 const css=document.createElement('link');css.rel='stylesheet';css.href='assets/maplibre.css';document.head.append(css);
 const lib=document.createElement('script');lib.src='fallback.js';lib.onload=()=>window.startHexViewer(p);document.head.append(lib);
 }catch{el('load').textContent='Could not load schools. Reload to try again.'}
}
legend(zoom);
frame.hidden=false;frame.style.opacity='0';frame.src='./geolibre/index.html?embed=1&maponly=1&theme=light&loading=true';
setTimeout(()=>{if(!confirmed)fallback()},65000);
projectPromise.catch(()=>{el('load').textContent='Could not load schools. Reload to try again.'});



function renderChart(bounds){
 if(!project||el('chart').hidden||!Array.isArray(bounds))return;
 const counts={Provincial:0,National:0};
 for(const f of project.layers.find(l=>l.id==='schools').geojson.features){
  const [x,y]=f.geometry.coordinates;
  if(x>=bounds[0]&&x<=bounds[2]&&y>=bounds[1]&&y<=bounds[3])counts[f.properties.level]++;
 }
 const total=counts.National+counts.Provincial;
 el('school-bars').innerHTML=Object.entries(counts).map(([label,n])=>'<div>'+label+' <b>'+n.toLocaleString('en-US')+'</b><span><i style="width:'+(total?100*n/total:0)+'%"></i></span></div>').join('');
}
el('toggle').onclick=()=>{
 const panel=el('chart');panel.hidden=!panel.hidden;el('toggle').setAttribute('aria-expanded',String(!panel.hidden));
 if(panel.hidden)return;
 if(usingFallback){window.hexViewer?.chart();return}
 command('getBounds',{},'chart-bounds');
};
