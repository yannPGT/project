// Test du script API officiel distribué, sans dépendance réseau implicite.
// GRIST_PLUGIN_API_SOURCE=/chemin/grist-plugin-api.js node connection-rpc.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=process.env.GRIST_PLUGIN_API_SOURCE;
if(!path){console.log('Test RPC : définir GRIST_PLUGIN_API_SOURCE vers le script officiel pour exécuter ce contrôle.');process.exit(0)}
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const startup=html.slice(html.indexOf('function startupFailure('),html.indexOf('</script>',html.indexOf('function startupFailure(')));
const loader=html.slice(html.indexOf('async function fetchTables(){'),html.indexOf(' S.yearMap=new Map',html.indexOf('async function fetchTables(){')))+'return data;}';
const tablesCode=html.match(/const TABLES=.+?;/)[0];
async function scenario(emitOptions){
 const requests=[],nodes={};let pending;const sends=[];
 const window={location:{href:'https://example.org/widget',pathname:'/widget'},print(){}};
 window.parent={postMessage(msg){sends.push(msg);queueMicrotask(()=>{
  if(msg.mtype===5&&emitOptions)window.onmessage({data:{mtype:4,data:{settings:{accessLevel:'full'}}}});
  if(msg.mtype===1){requests.push(msg.meth);const data=msg.meth==='fetchTable'?{id:[1],Label:['Test sans données réelles']}:undefined;
   window.onmessage({data:{mtype:2,reqId:msg.reqId,data}});
  }
 })}};
 const quiet={log(){},warn(){},error(){}};
 const context=vm.createContext({window,self:window,console:quiet,setTimeout,clearTimeout,Promise,Map,Set,WeakMap,URL,URLSearchParams,TextEncoder,TextDecoder});
 vm.runInContext(fs.readFileSync(path,'utf8'),context);window.grist=context.grist;
 Object.assign(context,{GEO:{dept:'dept',emiz:'emiz'},$:id=>nodes[id]??(nodes[id]={textContent:'',style:{},classList:{add(){},remove(){}}}),loadGeo:async()=>{},rows:t=>t.id.map((id,i)=>({id,Label:t.Label[i]})),timed:p=>p,refresh:()=>{pending=vm.runInContext('fetchTables()',context);return pending}});
 vm.runInContext(tablesCode+loader+startup,context);
 await new Promise(resolve=>setTimeout(resolve,350));assert(pending,'La lecture doit démarrer même sans événement onOptions');
 const data=await pending;assert.equal(Object.keys(data).length,12);assert.equal(requests.filter(x=>x==='fetchTable').length,12);assert(!requests.includes('listTables'));assert.equal(sends.filter(x=>x.mtype===5).length,1);
 assert.equal(data.BDD_SYNAPSE_2026[0].Label,'Test sans données réelles');
}
(async()=>{await scenario(false);await scenario(true);console.log('API officielle vérifiée : échanges RPC et lecture des 12 tables, avec et sans notification d’options ; aucun appel listTables.');})().catch(e=>{console.error(e);process.exitCode=1});
