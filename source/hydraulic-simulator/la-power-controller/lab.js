const $=id=>document.getElementById(id);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const els={size:$("size"),variant:$("variant"),p:$("p"),n:$("n"),pref:$("pref"),pc:$("pc"),flow:$("flow"),ev:$("ev"),em:$("em")};
const desc={LAD:"Güç kontrolü + yerel DR basınç kesme.",LADG:"Güç kontrolü + X hattından uzaktan ayarlanan basınç kesme.",LAS:"Güç kontrolü + ayrı debi kontrolü; bu laboratuvarda basınç kesme uygulanmaz.",LADS:"Güç kontrolü + basınç kesme + ayrı debi kontrolü."};
function cls(p){return p<=50?"LA5":p<=90?"LA6":p<=160?"LA7":p<=240?"LA8":"LA9"}
function calc(atP){
  const Vmax=+els.size.value,n=+els.n.value,p=atP??+els.p.value,nref=1500,Pref=+els.pref.value,etaV=+els.ev.value,etaM=+els.em.value,variant=els.variant.value,pc=+els.pc.value;
  const Mset=Pref*60000/(2*Math.PI*nref);
  const pStart=Mset*20*Math.PI*etaM/Vmax;
  const Vpower=p>0?Mset*20*Math.PI*etaM/p:Vmax;
  const hasFlow=variant==="LAS"||variant==="LADS",hasPC=variant!=="LAS";
  const Vflow=hasFlow?Vmax*(+els.flow.value/100):Vmax;
  let cut=1;if(hasPC){const band=Math.max(4,Math.min(12,pc*.035));cut=p<=pc-band?1:clamp((pc-p)/band,0,1)}
  const Veff=clamp(Math.min(Vmax,Vpower,Vflow)*cut,0,Vmax);
  const q=Veff*n*etaV/1000;
  const M=Veff*p/(20*Math.PI*Math.max(.01,etaM));
  const Pshaft=2*Math.PI*M*n/60000;
  const Ph=q*p/600;
  const flowLimited=hasFlow&&Vflow<=Math.min(Vmax,Vpower)+1e-6;
  let mode="Tam deplasman";
  if(hasPC&&cut<.995)mode="Basınç kesme";else if(flowLimited)mode="Debi kontrolü";else if(Vpower<Vmax-.001)mode="Sabit tork / güç kontrolü";
  return{Vmax,n,p,Pref,Mset,pStart,Veff,q,M,Pshaft,Ph,disp:Veff/Vmax,variant,pc,hasFlow,hasPC,cut,flowLimited,mode};
}
function fmt(v,d=1){return Number.isFinite(v)?v.toFixed(d):"—"}
function update(){const r=calc();
  $("vgVal").textContent=fmt(r.Vmax,1)+" cm³/dev";$("pVal").textContent=r.p+" bar";$("nVal").textContent=r.n+" d/dak";$("prefVal").textContent=fmt(r.Pref,1)+" kW @1500";$("pcVal").textContent=r.pc+" bar";$("flowVal").textContent=els.flow.value+" %";$("evVal").textContent=(+els.ev.value).toFixed(2);$("emVal").textContent=(+els.em.value).toFixed(2);
  $("variantTag").textContent={LAD:"LA.D",LADG:"LA.DG",LAS:"LA.S",LADS:"LA.DS"}[r.variant];$("variantDesc").textContent=desc[r.variant];$("pcField").hidden=!r.hasPC;$("flowField").hidden=!r.hasFlow;
  $("pStart").textContent=fmt(r.pStart,1)+" bar";$("mSet").textContent=fmt(r.Mset,1)+" Nm";$("laClass").textContent=cls(r.pStart);
  $("qOut").textContent=fmt(r.q,1);$("vgOut").textContent=fmt(r.Veff,1);$("dispOut").textContent=fmt(r.disp*100,0);$("mOut").textContent=fmt(r.M,1);$("pwOut").textContent=fmt(r.Pshaft,2);$("phOut").textContent=fmt(r.Ph,2);
  $("svgP").textContent=r.p+" bar";$("svgQ").textContent=fmt(r.q,1)+" L/dak";$("swash").style.transform=`rotate(${(1-r.disp)*38}deg)`;$("rotor").style.animationDuration=(clamp(1500/r.n,.55,2.2)).toFixed(2)+"s";$("flowAnim").style.animationDuration=(clamp(65/Math.max(2,r.q),.35,3)).toFixed(2)+"s";
  const powerOn=r.mode.includes("Sabit"),pressOn=r.mode==="Basınç kesme",flowOn=r.mode==="Debi kontrolü";$("powerCtrl").querySelector("rect").classList.toggle("on",powerOn);$("pressCtrl").querySelector("rect").classList.toggle("on",pressOn);$("flowCtrl").querySelector("rect").classList.toggle("on",flowOn);$("flowCtrl").style.opacity=r.hasFlow?"1":".18";$("pressCtrl").style.opacity=r.hasPC?"1":".18";$("pressTxt").textContent=r.variant==="LADG"?"DRG cut-off":"DR cut-off";$("pressSub").textContent=r.variant==="LADG"?"X hattı / remote":"yerel ayar";
  ["st1","st2","st3"].forEach(id=>$(id).classList.remove("on"));if(r.mode==="Basınç kesme")$("st3").classList.add("on");else if(r.mode==="Sabit tork / güç kontrolü")$("st2").classList.add("on");else $("st1").classList.add("on");
  let text="";if(r.mode==="Tam deplasman")text=`${fmt(r.pStart,1)} bar civarındaki kontrol başlangıcının altındasınız. Tork limiti henüz pompaya küçülme komutu vermiyor.`;if(r.mode==="Sabit tork / güç kontrolü")text=`Basınç arttığı için izin verilen deplasman ${fmt(r.Veff,1)} cm³/dev'e düştü. Böylece mil torku ${fmt(r.M,1)} Nm ile yaklaşık ayar torkunda kalıyor; p yükselirken q düşüyor.`;if(r.mode==="Debi kontrolü")text="Ayrı debi kontrolü swashplate'i güç eğrisinin izin verdiğinden daha küçük açıya zorluyor. Bu nedenle çalışma noktası LA güç eğrisinin altında.";if(r.mode==="Basınç kesme")text=`Basınç ${r.pc} bar ayarına yaklaştı. D fonksiyonu güç regülatörüne baskın hale geliyor ve pompa sıfır strok yönüne gidiyor.`;$("modeTitle").textContent=r.mode;$("modeText").textContent=text;
  drawChart(r);
}
function drawChart(r){const svg=$("chart"),W=500,H=410,l=62,t=28,rr=20,b=56,cw=W-l-rr,ch=H-t-b,pMax=300,qFull=r.Vmax*r.n*(+els.ev.value)/1000,qMax=Math.max(20,qFull*1.12),xp=p=>l+p/pMax*cw,yq=q=>t+ch-q/qMax*ch;let g=`<rect width="${W}" height="${H}" fill="#fff"/>`;
  for(let p=0;p<=300;p+=50){const x=xp(p);g+=`<path d="M${x} ${t}V${t+ch}" stroke="#ece8de"/><text x="${x}" y="${H-28}" text-anchor="middle" font-size="11" fill="#69757d">${p}</text>`}for(let f=0;f<=1.001;f+=.25){const q=qMax*f,y=yq(q);g+=`<path d="M${l} ${y}H${W-rr}" stroke="#ece8de"/><text x="${l-8}" y="${y+4}" text-anchor="end" font-size="11" fill="#69757d">${q.toFixed(0)}</text>`}g+=`<path d="M${l} ${t}V${t+ch}H${W-rr}" stroke="#102232" stroke-width="1.5"/><text x="${l+cw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="#65717a">Çalışma basıncı p [bar]</text><text transform="translate(16 ${t+ch/2}) rotate(-90)" text-anchor="middle" font-size="12" fill="#65717a">Debi q [L/dak]</text>`;
  let pts=[];for(let p=5;p<=300;p+=2){const x=calc(p);pts.push(`${xp(p).toFixed(1)},${yq(x.q).toFixed(1)}`)}g+=`<polyline points="${pts.join(" ")}" fill="none" stroke="#087f8c" stroke-width="3"/>`;
  const ps=xp(r.pStart);g+=`<path d="M${ps} ${t}V${t+ch}" stroke="#b98c15" stroke-width="1.5" stroke-dasharray="5 5"/><text x="${ps+5}" y="${t+16}" font-size="11" fill="#8a6b12">kontrol başlangıcı</text>`;if(r.hasPC){const pc=xp(r.pc);g+=`<path d="M${pc} ${t}V${t+ch}" stroke="#c0451b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="${Math.min(pc-5,W-120)}" y="${t+33}" font-size="11" fill="#a23b18">basınç kesme</text>`}
  g+=`<circle cx="${xp(r.p)}" cy="${yq(r.q)}" r="7" fill="#c0451b" stroke="#fff" stroke-width="3"/><text x="${Math.min(xp(r.p)+10,W-120)}" y="${Math.max(yq(r.q)-10,18)}" font-size="12" font-weight="700" fill="#102232">${r.p} bar · ${fmt(r.q,1)} L/dak</text>`;svg.innerHTML=g;
}
Object.values(els).forEach(el=>el.addEventListener("input",update));els.variant.addEventListener("change",update);els.size.addEventListener("change",update);update();
