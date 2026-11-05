'use strict';
window.startHexViewer=async function(p){
 project=p;const land=await fetch('assets/land.json').then(r=>r.json());
 const sources={land:{type:'geojson',data:land}},layers=[
 {id:'sea',type:'background',paint:{'background-color':'#d9e5e4'}},
 {id:'land',type:'fill',source:'land',paint:{'fill-color':'#edf0e4','fill-outline-color':'#bac8bb'}}];
 for(const layer of p.layers){
   sources[layer.id]={type:'geojson',data:layer.geojson};
   const base={id:layer.id,source:layer.id,minzoom:layer.style.minZoom,maxzoom:layer.style.maxZoom};
   if(layer.id==='schools'){layers.push({...base,type:'circle',paint:{'circle-radius':5,'circle-color':'#a7413e','circle-stroke-width':1.2,'circle-stroke-color':'#fff5e5'}})}
   else {layers.push({...base,type:'fill',paint:{'fill-color':['get','fill'],'fill-opacity':.96,'fill-outline-color':'#fff0cd'}})}
 }
 const m=new maplibregl.Map({container:'map',style:{version:8,sources,layers},center,zoom:fitZoom(),minZoom:5,maxZoom:16,dragRotate:false,pitchWithRotate:false,attributionControl:false});
 m.addControl(new maplibregl.AttributionControl({customAttribution:'NSDI Sri Lanka · Natural Earth · Survey Department / HDX',compact:true}),'bottom-right');
 const places=[[9.66,80.02,'Jaffna'],[6.93,79.85,'Colombo'],[7.29,80.64,'Kandy'],[6.03,80.22,'Galle'],[8.57,81.23,'Trincomalee'],[7.72,81.7,'Batticaloa']];
 for(const [lat,lng,name] of places){const label=document.createElement('span');label.className='area-label';label.textContent=name;new maplibregl.Marker({element:label,anchor:'left'}).setLngLat([lng,lat]).addTo(m)}
 m.on('load',()=>{el('load').hidden=true;legend(m.getZoom())});
 m.on('zoomend',()=>legend(m.getZoom()));
 m.on('click',event=>{
   const f=m.queryRenderedFeatures(event.point,{layers:p.layers.map(l=>l.id)})[0];if(!f)return;
   const a=f.properties,box=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('p');box.append(title,sub);
   if(f.layer.id==='schools'){title.textContent=a.name;sub.textContent=[a.level,a.ds,a.district].filter(Boolean).join(' · ')}
   else{title.textContent=a.count+' schools';sub.textContent=a.provincial+' provincial · '+a.national+' national';const btn=document.createElement('button');btn.textContent='Zoom in';box.append(btn);btn.onclick=()=>{pop.remove();m.easeTo({center:event.lngLat,zoom:Math.max(m.getZoom()+1,p.layers.find(l=>l.id===f.layer.id).style.maxZoom+.1)})}}
   const pop=new maplibregl.Popup().setLngLat(event.lngLat).setDOMContent(box).addTo(m);
 });
 const chart=()=>{const b=m.getBounds();renderChart([b.getWest(),b.getSouth(),b.getEast(),b.getNorth()])};m.on('moveend',chart);window.hexViewer={chart,changeZoom:delta=>m.easeTo({zoom:m.getZoom()+delta}),home:()=>m.easeTo({center,zoom:fitZoom()})};
};

