const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
scripts.forEach(s=>new vm.Script(s));
const nodes={},el=id=>nodes[id]??(nodes[id]={innerHTML:'',value:'',textContent:'',hidden:false,disabled:false,style:{},dataset:{},addEventListener(){},setAttribute(){},removeAttribute(){},classList:{toggle(){},add(){},remove(){}},querySelectorAll(){return[]}});
const c=vm.createContext({document:{getElementById:el,querySelector:()=>el('selectors'),querySelectorAll:()=>[]},window:{},console,Intl,Date,Map,Set,WeakMap,JSON,setTimeout,clearTimeout,requestAnimationFrame(){}});
vm.runInContext(scripts[0].slice(0,scripts[0].indexOf("$('year').addEventListener")),c);
vm.runInContext(scripts[1].slice(0,scripts[1].indexOf("$('compareMode').addEventListener")),c);
vm.runInContext(scripts[1].slice(scripts[1].indexOf('/* Programmation des exercices : lecture seule. */')),c);
const ev=s=>vm.runInContext(s,c),native=s=>JSON.parse(JSON.stringify(ev(s)));
const row=(id,name,date,territory='01 - Ain',extra={})=>({id,Annee:2026,Nom:name,Date:date,Niveau_administratif:territory,Zone:'ZD-SUD-EST',Etat:'Programmé',Posture:'Organisateur',Niveau:'Départemental',Risque:'Inondation',Type_de_risque:'Risques naturels',...extra});
c.fixture=[
 row(1,'Crue','2026-11-12','01 - Ain',{Acteurs:['L','SDIS','Gendarmerie'],Plan_dominant:42}),
 row(2,'Crue','2026-11-12','02 - Aisne',{Posture:'Joueur',Acteurs:'SAMU'}),
 row(3,'Zonal','2026-11-28','ZD-SUD-EST - SUD-EST',{Niveau:'Zonal'}),
 row(4,'Anticipation','2026-12-01','03 - Allier',{Etat:'Prévisionnel',Posture:'Direction'}),
 row(5,'Annulé','2026-11-05','01 - Ain',{Etat:'Annulé'}),
 row(6,'Brouillon','2026-11-05','01 - Ain',{Etat:'Brouillon'}),
 row(7,'Réalisé','2026-11-05','01 - Ain',{Etat:'Réalisé'}),
 row(8,'Sans date','','01 - Ain'),
 row(9,'Joueur isolé','2026-11-05','01 - Ain',{Posture:'Joueur'}),
 row(10,'Rôle inconnu','2026-11-05','01 - Ain',{Posture:''}),
 row(11,'Même nom','2026-11-08','04 - Alpes-de-Haute-Provence'),
 row(12,'Même nom','2026-11-08','05 - Hautes-Alpes'),
 row(13,'Même nom','2026-11-08','06 - Alpes-Maritimes',{Posture:'Joueur'}),
 row(14,'Octobre','2026-10-01'),row(15,'An suivant','2027-11-01'),
 row(16,'Sans risque','2026-11-11','01 - Ain',{Risque:''}),
 row(17,'ID commun','2026-11-20','07 - Ardèche',{ID_exercice:'SAME'}),
 row(18,'Autre titre','2026-11-20','08 - Ardennes',{ID_exercice:'SAME',Posture:'Joueur'}),
 row(19,'Risque 2','2026-11-21','01 - Ain',{Risque:'Séisme'}),
 row(20,'Date prévue','2026-10-20','01 - Ain',{Date_prevue:'2026-12-20'}),
 row(21,'Crue','2026-11-12','01 - Ain',{Plan_dominant:42})
];
ev("S.bdd=fixture;S.planById=new Map([[42,'ORSEC inondation']]);S.years=['2026'];S.admins=[];S.adminById=new Map();");
const before=JSON.stringify(c.fixture),m=native("programmingModel('2026',new Set([12,11]))");
assert.equal(m.records.length,9);assert.equal(m.monthly[0].total,7);assert.equal(m.monthly[1].total,2);
assert.equal(m.records[0].title,'Zonal');assert.equal(m.records.at(-1).title,'Anticipation');
const crue=m.records.find(r=>r.title==='Crue');
assert.equal(crue.plans,'ORSEC inondation');assert(crue.territories.indexOf('Organisateur')<crue.territories.indexOf('Joueurs'));assert(crue.territories.includes('02 - Aisne'));assert(crue.actors.includes('SAMU'));assert(!crue.actors.includes('L ;'));
assert.equal(m.unmatched.length,2);assert.equal(m.ambiguous.length,1);assert.equal(m.unresolved.length,1);assert.equal(m.undated.length,1);assert.equal(m.missingRisk,1);
assert(m.records.find(r=>r.title==='ID commun').territories.includes('08 - Ardennes'));
assert(!m.records.some(r=>['Annulé','Brouillon','Réalisé','Octobre','An suivant'].includes(r.title)));
assert.equal(m.risks[0][0],'Inondation');assert.equal(m.risks[0][1],7);
assert.equal(native("programmingModel('2026',new Set())").records.length,0);
assert.equal(ev("programmingModel('2027',new Set([11])).records.length"),1);
assert.equal(ev("programmingCsvCell('=HYPERLINK(\"x\")')"),'"\'=HYPERLINK(""x"")"');
assert.equal(ev("programmingCsvCell('a;\"b\\nc')"),'"a;""b\nc"');
ev("programmingState.year='2026';programmingState.months=new Set([12,11]);programmingInit();");
assert(nodes.programmingPreview.innerHTML.includes('novembre, décembre 2026'));assert.equal(nodes.programmingCsv.disabled,false);
ev("programmingState.months.clear();renderProgramming();");assert.equal(nodes.programmingPdf.disabled,true);
assert.equal(JSON.stringify(c.fixture),before);

console.log('PASS : filtres, annulations/brouillons/réalisés exclus, dates prévues, mois/zone/EMIZ/départements, déduplication, rattachement joueur certain, ambiguïtés, risques principaux, références plans, CSV, sélection vide et lecture seule.');
