// Steady-state educational model, not an actual spool/servo transient model.
// Equations: Bosch Rexroth RE 92705 (2019-03-25), pp. 7 and 9-14.
export const SIZES={45:3000,71.1:2550,100:2300,140:2200,180:1800};
export const DEFAULTS={size:71.1,variant:'LAD',pressure:80,speed:1500,power:20,cutoff:280,remote:180,demand:70,margin:14,ev:.95,em:.92};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function calculate(input){
 const c={...DEFAULTS,...input};
 for(const k of Object.keys(DEFAULTS))if(k!=='variant'&&!Number.isFinite(Number(c[k])))throw new TypeError('Invalid '+k);
 if(!Object.hasOwn(SIZES,c.size)||!['LAD','LADG','LAS','LADS'].includes(c.variant))throw new RangeError('Unsupported pump');
 const size=Number(c.size),n=clamp(Number(c.speed),0,SIZES[size]),ev=clamp(Number(c.ev),.8,1),em=clamp(Number(c.em),.8,1);
 const Mset=clamp(Number(c.power),1,120)*60000/(2*Math.PI*1500),pStart=Mset*20*Math.PI*em/size;
 const ls=['LAS','LADS'].includes(c.variant),hasCut=c.variant!=='LAS',margin=clamp(Number(c.margin),14,22);
 const pc=hasCut?Math.min(clamp(Number(c.cutoff),20,280),c.variant==='LADG'?clamp(Number(c.remote),0,260)+20:280):Infinity;
 const load=clamp(Number(c.pressure),0,ls?280-margin:280),demand=clamp(Number(c.demand),0,200),qmax=size*n*ev/1000;
 const cap=p=>Math.max(0,Math.min(size,p>0?Mset*20*Math.PI*em/p:size))*n*ev/1000;
 let p=0,q=0,mode='stopped';
 if(n>0){
  if(!ls){p=Math.min(load,pc);q=load>=pc?0:cap(p);mode=load>=pc?'pressure':p>pStart?'power':'full';}
  else if(demand===0){p=Math.min(margin,pc);q=0;mode='standby';}
  else if(load>=pc){p=pc;q=0;mode='pressure';}
  else{
   // Orifice sized for demand at the nominal LS margin. Saturation reduces margin.
   const upper=Math.min(load+margin,pc),orifice=p=>demand*Math.sqrt(Math.max(0,p-load)/margin);
   if(cap(upper)>=orifice(upper)){p=upper;q=orifice(p);mode=upper<load+margin?'pressure':'flow';}
   else{let a=load,b=upper;for(let i=0;i<65;i++){const m=(a+b)/2;if(cap(m)>orifice(m))a=m;else b=m;}p=(a+b)/2;q=cap(p);mode=p>pStart?'power':'full';}
  }
 }
 const V=n>0?q*1000/(n*ev):0,M=V*p/(20*Math.PI*em),shaft=2*Math.PI*M*n/60000,hydraulic=p*q/600;
 return {p,q,V,M,shaft,hydraulic,n,qmax,Mset,pStart,pc,ls,hasCut,load,margin,demand,ev,em,size,mode,disp:V/size,lsPressure:ls&&n>0&&demand>0?Math.min(load,p):0,actualMargin:ls?Math.max(0,p-(demand>0?load:0)):null,cap};
}
