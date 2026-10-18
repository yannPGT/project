const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
const nodes={};const el=id=>nodes[id]??(nodes[id]={innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,style:{},dataset:{},setAttribute(){},removeAttribute(){},querySelectorAll(){return[]},classList:{add(){},toggle(){},remove(){}}});
const ctx=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[]},window:{},console,Intl,Date,Map,Set,WeakMap,JSON,setTimeout,clearTimeout,requestAnimationFrame(){}});
vm.runInContext(scripts[0].slice(0,scripts[0].indexOf("$('year').addEventListener")),ctx);
vm.runInContext(scripts[1].slice(0,scripts[1].indexOf("$('compareMode').addEventListener")),ctx);
const evaluate=code=>vm.runInContext(code,ctx);
const native=code=>JSON.parse(JSON.stringify(evaluate(code)));
const row=(id,year,posture,state,type,risk,territory='01 - Ain',extra={})=>({id,Annee:year,Posture:posture,État:state,"Type d'exercice":type,'Type de risque':risk,Risque:risk,'Niveau administratif':territory,Zone:territory.startsWith('ZD-')?territory:'ZD-EST',...extra});
ctx.fixture=[
 row(1,2025,'Direction','Réalisé','Terrain','Risques naturels','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde','FR-Alert':'Oui'}),
 row(2,2025,'Vigilance','Réalisé','Cadres','Alerte, commandement et sauvegarde'),
 row(3,2025,'Vigilance','Réalisé','Terrain','Risques naturels','01 - Ain',{'Plans concourant':'Plan intercommunal de sauvegarde'}),
 row(4,2025,'Appui','Réalisé','Terrain','PLAYER_ONLY','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde'}),
 row(5,2025,'Direction','Programmé','Terrain','FUTURE_ONLY','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde'}),
 row(6,2025,'Direction','Annulé','Terrain','CANCEL_ONLY'),
 row(7,2025,'Direction','Réalisé',"Exercice d'alerte",'Risques naturels'),
 row(8,2025,'Veille','Réalisé','Cadre','Risques naturels','ZD-EST - EST'),
 row(9,2025,'Renforcé','Réalisé','Cadres','Risques naturels','ZD-EST - EST'),
 row(10,2025,'Vigilance','Réalisé','Terrain','Alerte, commandement et sauvegarde','ZD-EST - EST'),
 row(11,2026,'Organisateur','Réalisé','Terrain','Risques naturels'),
 row(12,2026,'Organisateur','Réalisé',"Exercice d'alerte",'Risques naturels'),
 row(13,2026,'Joueur','Réalisé','Terrain','PLAYER_2026','01 - Ain',{'Plan dominant':'Plan intercommunal de sauvegarde'}),
 row(14,2026,'Organisateur','Programmé','Terrain','FUTURE_2026'),
 row(15,2025,'Direction','Réalisé','Terrain','Alerte, commandement et sauvegarde'),
 row(16,2025,'','Réalisé','Terrain','UNKNOWN_ROLE','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde'}),
 row(17,2025,'Direction','Réalisé','Terrain','Risques naturels','ZD-EST - EST',{'Plan dominant':'Plan communal de sauvegarde'}),
 row(18,2025,'','Réalisé',"Exercice d'alerte",'Non renseigné'),
 row(19,2025,'Joueur','Réalisé','Terrain','Risques naturels','02 - Aisne',{'Plan dominant':'Plan communal de sauvegarde','Plans concourant':'Plan communal de sauvegarde; Plan intercommunal de sauvegarde'}),
 row(20,2025,'Joueur','Programmé','Terrain','FUTURE_PLAN','01 - Ain',{'Plan dominant':'Plan intercommunal de sauvegarde'}),
 row(21,2025,'Joueur','Annulé','Terrain','CANCEL_PLAN','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde'}),
 row(22,2025,'Joueur','Réalisé',"Exercice d'alerte",'Risques naturels','01 - Ain',{'Plan dominant':'Plan communal de sauvegarde'}),
];
evaluate("S.bdd=fixture;S.admins=[];S.adminById=new Map();S.ind=[];S.objectives=[];S.finance=[];S.year='2025';S.yearMap=new Map();");
let d=native("comparisonYear('2025')");
assert.equal(d.dept.real,2);assert.equal(d.dept.planned,1);assert.equal(d.dept.cancel,1);assert.equal(d.zone.real,3);
assert.deepEqual(d.commandAlerts,{dept:3,zone:1});assert.equal(d.pcs,3);assert.equal(d.pics,2);assert.equal(d.alerts.fr,1);
assert.deepEqual(native("departmentalPlanCounts('2025','code:02')"),{pcs:1,pics:1});
assert(!JSON.stringify(d.riskCounts).includes('FUTURE_ONLY'));assert(!JSON.stringify(d.riskCounts).includes('CANCEL_ONLY'));assert(!JSON.stringify(d.riskCounts).includes('PLAYER_ONLY'));
assert.equal(d.typeCounts.reduce((n,x)=>n+x[1],0),5);
assert.equal(d.typeCounts.find(x=>x[0]==='Cadres')[1],2);
assert.equal(evaluate('canonicalPosture(S.bdd[2])'),'Joueur');assert.equal(evaluate('isCommandChainAlert(S.bdd[14])'),false);
evaluate("S.ind=[{Annee:2026,Type_niveau:'Département',Niveau_administratif:'01 - Ain',Nb_Realise:999,Objectif:4}];S.year='2026';comparisonYearCache.clear();");
assert.equal(evaluate("stat(S.ind[0]).real"),1);assert.equal(evaluate("comparisonYear('2026').dept.real"),1);
assert.equal(evaluate("comparisonYear('2026').commandAlerts.dept"),1);
assert.equal(evaluate("comparisonYear('2026').pics"),1);
evaluate("S.year='2025';comparisonYearCache.clear();renderAll();renderComparison();reportSelectedYear='2025';renderAnnualReport();renderDepartmentDetail();");
assert(!nodes.deptRisks.innerHTML.includes('FUTURE_ONLY'));assert(!nodes.detailDeptRisks.innerHTML.includes('FUTURE_ONLY'));
assert(nodes.deptMetrics.innerHTML.includes('chaîne de commandement'));assert(nodes.annualReportBody.innerHTML.includes('alerte de la chaîne de commandement'));
assert.equal(evaluate("annualAiPayload(annualReportData('2025')).departmentalImplementedPlans.pcsExercises"),3);
assert(nodes.annualReportBody.innerHTML.includes('PCS et PICS mis en œuvre au niveau départemental'));
assert(nodes.detailDeptMetrics.innerHTML.includes('Exercices avec PCS'));
const before=native("comparisonYear('2025')");const plan=native('buildPostureMigration(S.bdd)');
assert.equal(plan.updates.find(x=>x.id===2).after,'Organisateur');assert.equal(plan.updates.find(x=>x.id===3).after,'Joueur');assert(plan.updates.find(x=>x.id===2).alert);
assert(!plan.updates.some(x=>x.year>=2026));assert(plan.unresolved.some(x=>x.id===16));
assert.equal(evaluate("exerciseDay({Date:'31/02/2025'})"),'');
assert.equal(evaluate("exerciseDay({Date:'29/02/2024'})"),'2024-02-29');
assert.equal(evaluate("number('1 234,50 €')"),1234.5);
assert.equal(evaluate("isCommandChainAlert({Annee:2026,Posture:'Organisateur',Type_d_exercice:'Exercices d’alerte'})"),true);
evaluate("S.planById=new Map([[99,'Plan communal de sauvegarde']]);");
assert.deepEqual(native("planTypesImplemented({Plans_concourant:['L',99]})"),['PCS']);
evaluate("S.objectives=[{Annee:2025,Actif:true,Niveau:'Département',Code_objectif:'NOVI',Groupe_objectif:'ALT'},{Annee:2025,Actif:true,Niveau:'Département',Code_objectif:'POP',Groupe_objectif:'ALT'}];");
assert.equal(evaluate("categoryValue({Couverture_NOVI:'Réalisé',Couverture_POP:'Non couvert'},'OBJECTIF_QUAL','dept').value"),'Réalisé');
assert.equal(evaluate("categoryValue({Couverture_NOVI:'Non couvert',Couverture_POP:'Programmé'},'OBJECTIF_QUAL','dept').value"),'Programmé');
evaluate('S.objectives=[];comparisonYearCache.clear();');
ctx.plan=plan;
evaluate("S.bdd=S.bdd.map(r=>{const u=plan.updates.find(x=>x.id===r.id);return u?{...r,Posture:u.after,Posture_origine:u.origin,Exercice_alerte_chaine_commandement:u.alert}:r});exerciseLedgerCache.clear();comparisonYearCache.clear();");
const after=native("comparisonYear('2025')");assert.deepEqual(after,before);assert.equal(evaluate('buildPostureMigration(S.bdd).updates.length'),0);
evaluate("S.year='2025';S.plan='Plan communal de sauvegarde';S.deptTheme='REALISES';");
(async()=>{
 const counts=await evaluate('ensurePlanCounts()');assert.equal(counts.get('code:01'),1);
 // Exercer la migration via les mêmes actions Grist que le widget, sans serveur ni données réelles.
 const records=JSON.parse(JSON.stringify(ctx.fixture));
 const keys=[...new Set(records.flatMap(Object.keys))],table=Object.fromEntries(keys.map(k=>[k,records.map(r=>r[k]??null)]));
 let actionBatches=0;
 let legacyFormula='';
 ctx.grist={docApi:{fetchTable:async name=>name==='_grist_Tables'?{id:[1],tableId:['BDD_SYNAPSE_2026']}:name==='_grist_Tables_column'?{id:legacyFormula?[1]:[],parentId:legacyFormula?[1]:[],colId:legacyFormula?['Est_organisateur']:[],formula:legacyFormula?[legacyFormula]:[]}:table,applyUserActions:async actions=>{actionBatches++;for(const a of actions){if(a[0]==='AddColumn'){table[a[2]]=table.id.map(()=>null)}else if(a[0]==='BulkUpdateRecord'){for(const [field,values]of Object.entries(a[3]))a[2].forEach((id,i)=>{table[field][table.id.indexOf(id)]=values[i]})}else throw Error('Action inattendue');}}}};
 evaluate("fetchTables=async()=>{};");
 await evaluate('previewPostureMigration()');assert.equal(actionBatches,0);
 await evaluate('applyPostureMigration()');assert.equal(actionBatches,1);
 assert.equal(table.Posture[table.id.indexOf(2)],'Organisateur');assert.equal(table.Posture_origine[table.id.indexOf(2)],'Vigilance');
 assert.equal(table.Posture[table.id.indexOf(3)],'Joueur');assert.equal(table.Posture[table.id.indexOf(11)],'Organisateur');
 assert.equal(table.Posture_origine[table.id.indexOf(11)],null);assert(nodes.postureStatus.textContent.includes('corrigées dans Grist et contrôlées'));
 legacyFormula='$Posture == "Direction"';
 await evaluate('previewPostureMigration()');assert.equal(nodes.postureApply.disabled,true);
 await evaluate('applyPostureMigration()');assert.equal(actionBatches,1);assert(nodes.postureStatus.textContent.includes('formules historiques'));
 console.log('Cas contrôlés : réalisés seuls, joueurs inclus pour PCS/PICS et exclus des autres décomptes, alertes séparées, plans cartographiques, compteurs 2026 recalculés, migration idempotente.');
 // Retards : même population pour les compteurs, les cartes et les listes.
 ctx.overdueFixture=[
  row(101,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026',Nom:'Exercice dépassé'}),
  row(102,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'18/10/2026',Nom:'Exercice du jour'}),
  row(103,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'19/10/2026'}),
  row(104,2026,'Organisateur','Réalisé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026'}),
  row(105,2026,'Organisateur','Annulé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026'}),
  row(106,2026,'Joueur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026'}),
  row(107,2026,'Organisateur','Programmé',"Exercice d'alerte",'Risques naturels','01 - Ain',{Date:'17/10/2026'}),
  row(108,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:''}),
  row(109,2026,'Organisateur','Programmé','Cadres','Menaces','ZD-EST - EST',{Date:'16/10/2026',Nom:'Exercice de zone'}),
  row(110,2026,'Organisateur','Programmé','Cadres','Menaces','ZD-EST - EST',{Date:'18/10/2026'}),
  row(111,2026,'Organisateur','Programmé','Cadres','Menaces','ZD-GUYANE - GUYANE',{Date:'17/10/2026'}),
  row(112,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'30/02/2026'}),
  row(113,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'01/01/2027',Date_programmation:'15/10/2026',Nom:'Programmation prioritaire'}),
  row(114,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026',Date_programmation:'01/11/2026'}),
  row(115,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026',Nom:'<img src=x onerror=alert(1)>'}),
  row(116,2026,'','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2026'}),
  row(117,2025,'Direction','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'17/10/2025',Nom:'Exercice 2025'}),
  row(119,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:Date.UTC(2026,9,17)/1000}),
  row(120,2026,'Organisateur','Programmé','Terrain','Risques naturels','01 - Ain',{Date:'2026-10-17'}),
 ];
 ctx.testToday='2026-10-18';
 evaluate("const savedParisToday=parisToday;parisToday=()=>testToday;S.bdd=overdueFixture;S.ind=[];S.objectives=[];S.year='2026';exerciseLedgerCache.clear();comparisonYearCache.clear();reportDataCache.clear();renderOverdueOverview();");
 assert.equal(evaluate("overdueExercises('dept').length"),5);assert.equal(evaluate("overdueExercises('emiz').length"),1);
 assert.equal(evaluate("departments().reduce((n,r)=>n+stat(r).late,0)"),5);
 assert.equal(evaluate("emizRows().reduce((n,r)=>n+stat(r,'emiz').late,0)"),1);
 assert.equal(nodes.deptOverdueCount.textContent,'5');assert.equal(nodes.emizOverdueCount.textContent,'1');
 assert(nodes.deptOverdueRows.innerHTML.includes('Programmation prioritaire'));
 assert(nodes.deptOverdueRows.innerHTML.indexOf('15/10/2026')<nodes.deptOverdueRows.innerHTML.indexOf('17/10/2026'));
 assert(!nodes.deptOverdueRows.innerHTML.includes('<img'));assert(nodes.deptOverdueRows.innerHTML.includes('&lt;img'));
 assert(!nodes.deptOverdueRows.innerHTML.includes('Exercice du jour'));
 assert(nodes.emizOverdueRows.innerHTML.includes('Exercice de zone')&&nodes.emizOverdueRows.innerHTML.includes('Cadres'));
 ctx.testToday='2026-10-19';
 assert.equal(evaluate("overdueExercises('dept').length"),6);assert.equal(evaluate("overdueExercises('emiz').length"),2);
 evaluate("S.year='2025';renderOverdueOverview();");
 assert.equal(nodes.deptOverdueCount.textContent,'1');assert(nodes.deptOverdueRows.innerHTML.includes('Exercice 2025'));
 assert.equal(nodes.emizOverdueCount.textContent,'0');assert(nodes.emizOverdueRows.innerHTML.includes('Aucun exercice en retard'));
 evaluate('parisToday=savedParisToday;');
 console.log('Retards vérifiés : dates dépassées, filtre année/rôle/état, listes triées, dates explicites/ISO/Unix, échappement et changement de jour.');
 if(!process.env.GRIST_AUDIT_DATA){console.log('Pour vérifier un export local : définir GRIST_AUDIT_DATA vers un JSON {bdd,objectives}. Aucun export réel n’est inclus dans le dépôt.');return}
 const data=JSON.parse(fs.readFileSync(process.env.GRIST_AUDIT_DATA,'utf8'));ctx.realData=data;
 evaluate("S.bdd=realData.bdd.map((r,i)=>({...r,id:i+1}));S.objectives=realData.objectives;S.ind=[];S.admins=[];S.adminById=new Map();S.finance=[];exerciseLedgerCache.clear();comparisonYearCache.clear();reportDataCache.clear();");
 const results=[];const started=Date.now();
 for(const year of ['2024','2025','2026']){
  ctx.targetYear=year;
  evaluate("S.year=targetYear;renderAll();reportSelectedYear=targetYear;renderAnnualReport();");
  const item=native('comparisonYear(S.year)'),report=native('annualReportData(S.year)');
  assert.equal(item.dept.real,report.dept.length);assert.equal(item.zone.real,report.zone.length);
  assert.equal(item.typeCounts.reduce((n,x)=>n+x[1],0),item.dept.real+item.zone.real);
  assert.equal(evaluate("departments().reduce((n,r)=>n+stat(r).real,0)"),item.dept.real);
  assert.equal(evaluate("emizRows().reduce((n,r)=>n+stat(r,'emiz').real,0)"),item.zone.real);
  const plan=native('buildPostureMigration(S.bdd)');
  results.push({year,departments:item.dept.real,zones:item.zone.real,alerts:item.commandAlerts,unresolved:item.quality,postureCorrections:plan.updates.length});
 }
 const fullBefore=native('COMPARE_YEARS.map(comparisonYear)');
 evaluate("const fullPlan=buildPostureMigration(S.bdd);S.bdd=S.bdd.map(r=>{const u=fullPlan.updates.find(x=>x.id===r.id);return u?{...r,Posture:u.after,Posture_origine:u.origin,Exercice_alerte_chaine_commandement:u.alert}:r});exerciseLedgerCache.clear();comparisonYearCache.clear();reportDataCache.clear();");
 assert.deepEqual(native('COMPARE_YEARS.map(comparisonYear)'),fullBefore);
 console.log('Export de 3 730 fiches : concordance générale / détails / comparaison / synthèse / migration vérifiée.');
 console.log(JSON.stringify({results,elapsedMs:Date.now()-started},null,2));

})().catch(e=>{console.error(e);process.exitCode=1});
