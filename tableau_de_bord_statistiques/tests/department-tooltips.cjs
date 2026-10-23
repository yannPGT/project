const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
const nodes={};const el=id=>nodes[id]??(nodes[id]={innerHTML:'',textContent:'',value:'',hidden:false,style:{},dataset:{},setAttribute(){},removeAttribute(){},querySelectorAll(){return[]},classList:{add(){},toggle(){},remove(){}}});
const ctx=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[]},window:{},console,Intl,Date,Map,Set,WeakMap,JSON,setTimeout,clearTimeout,requestAnimationFrame(){}});
vm.runInContext(scripts[0].slice(0,scripts[0].indexOf("$('year').addEventListener")),ctx);
vm.runInContext(scripts[1].slice(0,scripts[1].indexOf("$('compareMode').addEventListener")),ctx);
const run=code=>vm.runInContext(code,ctx);
const row=(id,extra={})=>({id,Annee:2026,Posture:'Organisateur',État:'Réalisé',"Type d'exercice":'Terrain',Risque:'Inondation','Type de risque':'Risques naturels','Niveau administratif':'01 - Ain',Nom:'Exercice '+id,Date:'2026-05-02',...extra});
ctx.fixture=[
 row(1,{Nom:'Alpha "<test>"',Date:'2026-03-01','DO joué':'Oui','qui DO':['L','Préfet','Maire','Préfet'],'Alerte à la population':'Oui','Population impliquée':'Oui','Plan dominant':'ORSEC inondation','Utilisation FR ALERT':'Oui',Financement_demande:500,Financement_recu:0}),
 row(2,{Date:'04/05/2026',État:'Programmé',Financement_demande:200,Financement_recu:''}),
 row(3,{'Niveau administratif':'02 - Aisne'}),
 row(4,{Annee:2025}),row(5,{État:'Annulé',Financement_demande:900}),
 row(6,{Posture:'Joueur'}),row(7,{Date:null,Nom:'Date absente'}),
];
run("S.bdd=fixture;S.admins=[];S.adminById=new Map();S.ind=[];S.objectives=[];S.finance=[];S.year='2026';S.yearMap=new Map();");
run("renderDepartmentStatistics('test',realizedExercises('dept').filter(r=>territoryKey(r)==='code:01'),departmentalPlanCounts('2026','code:01'))");
for(const suffix of ['Types','Risks','Actors','Public','Plans']){
 const output=nodes['test'+suffix].innerHTML;
 assert(output.includes('Alpha &quot;&lt;test&gt;&quot; — 01/03/2026'),suffix);
 for(const id of [2,3,4,5,6])assert(!output.includes('Exercice '+id+' —'),suffix+' excludes '+id);
 assert(!output.includes('<test>'));
}
assert(nodes.testTypes.innerHTML.includes('Date absente — Date non renseignée'));
assert(nodes.testPublic.innerHTML.includes('Aucun exercice correspondant.'));
assert.equal((nodes.testActors.innerHTML.match(/Alpha &quot;/g)||[]).length,3,'DO total and each distinct actor');
const money=run("financeSourceRows().filter(r=>territoryKey(r)==='code:01')");ctx.money=money;
const finance=run('financeMetrics(financeSummary(money),money)');
assert(finance.includes('Exercice 2 — 04/05/2026 — 200'));
assert(!finance.includes('Exercice 5 —'));
assert(finance.includes('01/03/2026 — 0'),'zero received is explicitly recorded');
assert.equal((finance.match(/Exercice 2 —/g)||[]).length,1,'blank received is omitted');
run("S.year='2025';renderDepartmentStatistics('test',realizedExercises('dept').filter(r=>territoryKey(r)==='code:01'),departmentalPlanCounts('2025','code:01'))");
assert(nodes.testTypes.innerHTML.includes('Exercice 4 —'));
assert(!nodes.testTypes.innerHTML.includes('Alpha'));
run("S.year='2026';renderDepartmentStatistics('test',realizedExercises('dept').filter(r=>territoryKey(r)==='code:02'),departmentalPlanCounts('2026','code:02'))");
assert(nodes.testTypes.innerHTML.includes('Exercice 3 —'));
assert(!nodes.testTypes.innerHTML.includes('Alpha'));
const many=run("limitedBarRows(Array.from({length:12},(_,i)=>['Plan '+i,1]),10,()=>[fixture[0]])");
assert.equal((many.match(/Alpha &quot;/g)||[]).length,12,'hidden plans retain tooltips');
if(process.env.TOOLTIP_PREVIEW)fs.writeFileSync(process.env.TOOLTIP_PREVIEW,'<!doctype html><meta charset="utf-8"><style>'+html.match(/<style>([\s\S]*?)<\/style>/)[1]+'</style><main class="page"><h2>Vue départementale — contrôle des infobulles</h2>'+Object.entries(nodes).filter(([k])=>k.startsWith('test')).map(([k,v])=>'<section id="'+k+'">'+v.innerHTML+'</section>').join('')+'<section id="money">'+finance+'</section></main>');
console.log('Infobulles vérifiées : catégories, DO multi-acteurs, plans dépliables, population, montants, zéro reçu, dates et échappement ; filtres département/année.');
