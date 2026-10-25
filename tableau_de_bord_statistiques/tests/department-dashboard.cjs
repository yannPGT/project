// Fixtures synthétiques : aucune donnée du document utilisateur.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path'),html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
const nodes={},el=id=>nodes[id]??(nodes[id]={innerHTML:'',textContent:'',value:'',hidden:false,style:{},dataset:{},setAttribute(){},removeAttribute(){},querySelectorAll(){return[]},classList:{add(){},toggle(){},remove(){}}});
const ctx=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[]},window:{},console,Intl,Date,Map,Set,WeakMap,JSON,setTimeout,clearTimeout,requestAnimationFrame(){}});
const source0=scripts[0].slice(0,scripts[0].indexOf("$('year').addEventListener")),source1=scripts[1].slice(0,scripts[1].indexOf("$('compareMode').addEventListener"));
vm.runInContext(source0,ctx);vm.runInContext(source1,ctx);
const run=s=>vm.runInContext(s,ctx),native=s=>JSON.parse(JSON.stringify(run(s)));
const row=(id,year,extra={})=>({id,Annee:year,Posture:'Organisateur',État:'Réalisé',"Type d'exercice":'Terrain','Type de risque':'Risques naturels',Risque:'Inondation','Niveau administratif':'01 - Ain',Nom:'Exercice '+id,Date:year+'-03-02','Plan dominant':'ORSEC inondation',...extra});
ctx.fixture=[row(1,2023),row(2,2024),row(3,2025,{'DO joué':'Oui','qui DO':'Préfet','Alerte à la population':'Oui',Financement_demande:2000,Financement_recu:1500}),
 row(4,2026,{Nom:'Alpha "<test>"','DO joué':'Oui','qui DO':'Préfet','Population impliquée':'Oui','Utilisation FR ALERT':'Oui',Financement_demande:2500,Financement_recu:0}),
 row(5,2026,{État:'Programmé',Financement_demande:1000}),row(6,2026,{Posture:'Joueur','Plan dominant':'Plan communal de sauvegarde'}),
 row(7,2026,{'Niveau administratif':'02 - Aisne',Nom:'EXCLU AISNE'}),row(8,2027),row(9,2026,{État:'Annulé',Nom:'ANNULATION',Financement_demande:900}),
 row(10,2026,{"Type d'exercice":"Exercice d'alerte",Nom:'ALERTE SEPAREE'})];
ctx.indicators=[2023,2024,2025,2026].map(y=>({Annee:y,Type_niveau:'Département',Niveau_administratif:'01 - Ain',Objectif:y===2023?2:4}));
const init="S.bdd=fixture;S.admins=[];S.adminById=new Map();S.ind=indicators;S.objectives=[];S.finance=[];S.year='2026';S.yearMap=new Map();";
run(init);
const years=['2020','2021','2022','2023','2024','2025','2026','2027','2028'];ctx.years=years;
let model=native("departmentDashboardModel('code:01',years)");
assert.deepEqual(model.years,['2022','2023','2024','2025','2026']);assert.equal(model.reference.year,'2025');assert.equal(model.target.real,1);assert.equal(model.target.planned,1);assert.equal(model.target.pcs,1);
run("renderDepartmentComparison('code:01','01 - Ain')");let output=nodes.detailDeptComparison.innerHTML;
assert(output.includes('Voir la comparaison chiffrée'));assert(!/<details[^>]*data-dc-section="numeric"[^>]*\bopen/.test(output));
assert(output.includes('Comparaison provisoire'));assert(output.includes('Alpha &quot;&lt;test&gt;&quot;'));
assert(!output.includes('EXCLU AISNE'));assert(!output.includes('NaN'));assert(!output.includes('Infinity'));
assert.equal(native("departmentDashboardExercises('code:01','2026','cancel').map(r=>r.id)")[0],9);
assert.deepEqual(native("departmentDashboardExercises('code:01','2026','planned').map(r=>r.id)"),[5]);
assert.deepEqual(native("departmentDashboardExercises('code:01','2026','alerts').map(r=>r.id)"),[10]);
assert.equal(native("departmentDashboardModel('code:01',years)").target.money.asked,3500);
const empty=run("departmentDashboardAnnual('code:01',[departmentComparisonYear('2020','code:01')])");assert(empty.includes('>—</text>'));assert(!empty.includes('NaN'));
run("departmentDashboardState.period='all';departmentDashboardState.future=true");
model=native("departmentDashboardModel('code:01',years)");assert.deepEqual(model.years,years);
run("departmentDashboardState.target='2025';departmentDashboardState.reference='2023';departmentDashboardState.open.add('numeric');renderDepartmentComparison('code:01','01 - Ain')");
output=nodes.detailDeptComparison.innerHTML;assert(/data-dc-section="numeric" open/.test(output));assert(!output.includes('dc-badge'));
assert.equal(native("departmentDashboardModel('code:01',years)").reference.goal,2);
run("departmentDashboardState.open.clear();S.year='2025'");model=native("departmentDashboardModel('code:01',years)");assert.equal(model.target.year,'2025');
run("S.year='2026';departmentDashboardState.period='5';departmentDashboardState.future=false;renderDepartmentComparison('code:02','02 - Aisne')");
output=nodes.detailDeptComparison.innerHTML;assert(output.includes('EXCLU AISNE'));assert(!output.includes('Alpha &quot;'));
// Le HTML extérieur, les calculs, les styles existants et la connexion restent identiques.
if(process.env.DASHBOARD_BASELINE){
 const baseline=fs.readFileSync(process.env.DASHBOARD_BASELINE,'utf8');
 const normalize=s=>s.replace(/\n#detailDeptComparison\{--dc-ink:[\s\S]*?(?=\n<\/style>)/,'').replace(/\/\/ Présentation réservée à la comparaison départementale[\s\S]*?(?=function renderDepartmentComparison\()/,'').replace(/function renderDepartmentComparison\([\s\S]*?(?=\nfunction renderDepartmentDetail\()/,'');
 assert.equal(normalize(html),normalize(baseline),'modification limitée à la comparaison départementale');
}
if(process.env.DASHBOARD_PREVIEW){
 const mock=JSON.stringify({fixture:ctx.fixture,indicators:ctx.indicators}).replace(/</g,'\\u003c');
 const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
 fs.writeFileSync(process.env.DASHBOARD_PREVIEW,'<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main class="page" style="max-width:1400px"><details id="detailDeptComparisonPanel" open><summary>Comparer les années — département sélectionné</summary><div id="detailDeptComparison"></div></details></main><script>'+source0+'<\/script><script>'+source1+'\nconst mock='+mock+';const fixture=mock.fixture,indicators=mock.indicators;'+init+'renderDepartmentComparison("code:01","01 - Ain");<\/script></html>');
}
console.log('Dashboard départemental vérifié : périodes, deux années, années absentes/futures, objectifs annuels, filtres, infobulles, chiffres repliés et absence de changements extérieurs.');
// Optionnel : générer le preview ci-dessus, puis tester les vraies interactions.
if(process.env.DASHBOARD_BROWSER){
 (async()=>{
  const {chromium}=require('playwright');
  const browser=await chromium.launch({headless:true,executablePath:process.env.DASHBOARD_BROWSER,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
  try{
   const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file://'+process.env.DASHBOARD_PREVIEW);
   assert.equal(await page.locator('.dc-chart').count(),2);
   const numeric=page.locator('[data-dc-section="numeric"]');assert.equal(await numeric.getAttribute('open'),null);
   await numeric.locator(':scope > summary').click();assert.notEqual(await numeric.getAttribute('open'),null);
   await page.locator('[data-dc-control="reference"]').selectOption('2024');
   assert.notEqual(await numeric.getAttribute('open'),null,'numeric panel stays open');
   await page.locator('[data-dc-control="target"]').selectOption('2025');
   assert.equal(await page.locator('.dc-kpi').first().locator('span').textContent(),'Exercices réalisés · 2025');
   assert.equal(await page.evaluate(()=>S.year),'2026','global year unchanged');
   assert.equal(await page.locator('.dc-badge').count(),0);
   await page.locator('[data-dc-control="future"]').check();
   assert((await page.locator('.dc-chart').first().textContent()).includes('2027'));
   await page.locator('[data-dc-control="future"]').uncheck();
   assert(!(await page.locator('.dc-chart').first().textContent()).includes('2027'));
   await page.locator('[data-dc-control="target"]').selectOption('2026');
   await numeric.locator(':scope > summary').click();
   await page.locator('[data-dc-section="public"] > summary').click();
   assert((await page.locator('[data-dc-section="public"] .dc-track-row[title]').count())>0);
   const tip=await page.locator('[data-dc-section="public"] .dc-track-row').nth(1).getAttribute('title');assert(tip.includes('Alpha "<test>"'));
   await page.locator('[data-dc-section="plans"] > summary').click();
   await page.screenshot({path:'/tmp/department-dashboard-desktop.png',fullPage:true});
   await page.setViewportSize({width:390,height:844});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);assert.equal(overflow,false,'no horizontal overflow on mobile');
   await page.screenshot({path:'/tmp/department-dashboard-mobile.png',fullPage:true});
   await page.evaluate(()=>{S.year='2025';renderDepartmentComparison('code:02','02 - Aisne')});
   assert(!(await page.locator('#detailDeptComparison').textContent()).includes('Alpha'));
   assert.deepEqual(errors,[]);
   console.log('Chromium : sélecteurs, période, volets, infobulles, changement de département/année et affichage mobile vérifiés.');
  }finally{await browser.close()}
 })().catch(e=>{console.error(e);process.exitCode=1});
}
