const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const source=html.slice(html.indexOf('function startupFailure('),html.indexOf('</script>',html.indexOf('function startupFailure(')));
function setup({embedded=true,api=true,optionsEvent=true,synchronousLevel}={}){
 const nodes={},timers=new Map();let reads=0,ready=0,callback,seq=0;
 const grist=api?{docApi:{fetchTable:async()=>({id:[]})},ready(){ready++;if(synchronousLevel)callback(null,{accessLevel:synchronousLevel})}}:undefined;
 if(api&&optionsEvent)grist.onOptions=fn=>{callback=fn};
 const window={grist};window.parent=embedded?{}:window;
 const context=vm.createContext({window,grist,GEO:{dept:'dept',emiz:'emiz'},$:id=>nodes[id]??(nodes[id]={textContent:'',style:{},classList:{add(){},remove(){}}}),setTimeout(fn,ms){const id=++seq;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},refresh(){reads++},loadGeo:async()=>{},Promise,Error});
 vm.runInContext(source,context);
 return {nodes,timers,get reads(){return reads},get ready(){return ready},options(level){callback(null,{accessLevel:level})},legacyOptions(level){callback(null,{access_level:level})},run(ms){for(const [id,t]of [...timers])if(t.ms===ms){timers.delete(id);t.fn()}}};
}
let t=setup({embedded:false});assert.equal(t.ready,0);assert.equal(t.reads,0);assert(t.nodes.error.textContent.includes('widget seul'));
t=setup({api:false});assert(t.nodes.error.textContent.includes('API Grist indisponible'));
// Cas de la capture : aucun événement onOptions reçu, mais lecture API autorisée.
t=setup();assert.equal(t.ready,1);assert.equal(t.reads,0);t.run(300);assert.equal(t.reads,1);assert.equal(t.timers.size,0);
t.options('full');t.run(0);assert.equal(t.reads,1);
t=setup({optionsEvent:false});t.run(300);assert.equal(t.reads,1);
t=setup();t.options('none');t.run(300);assert.equal(t.reads,0);assert(t.nodes.error.textContent.includes('accès insuffisant'));
t.options('read table');t.run(0);assert.equal(t.reads,0);
t.options('full');t.run(0);assert.equal(t.reads,1);assert.equal(t.nodes.error.style.display,'none');
t.options('full');t.run(0);assert.equal(t.reads,1);
t.options('none');t.options('full');t.run(0);assert.equal(t.reads,2);
t=setup();t.legacyOptions('full');t.run(300);assert.equal(t.reads,1);
t=setup({synchronousLevel:'full'});t.run(300);assert.equal(t.reads,1);assert.equal(t.timers.size,0);
console.log('Connexion vérifiée : lecture sans onOptions, API ancienne, champs accessLevel/access_level, refus explicite respecté, reprise et absence de lectures doublonnées.');
