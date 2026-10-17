#!/usr/bin/env node
/**
 * Essai local Albert API pour la synthèse annuelle.
 * Node.js >= 18. ALBERT_API_KEY doit rester dans une variable d'environnement locale.
 * Usage : node albert_essai_local.mjs chemin/vers/resume.json
 */
import {readFile} from 'node:fs/promises';

const key=process.env.ALBERT_API_KEY,model=process.env.ALBERT_MODEL||'openweight-small';
const file=process.argv[2];
if(!key||!file){
 console.error('Définissez ALBERT_API_KEY dans votre session et indiquez un résumé JSON local.');
 process.exitCode=2;
}else{
 try{
  const raw=await readFile(file,'utf8');
  if(raw.length>30000)throw new Error('Le résumé dépasse la limite de 30 000 caractères.');
  const payload=JSON.parse(raw);
  if(payload.version!==1||!['2024','2025','2026'].includes(String(payload.year))||
     !payload.exercises?.department||!payload.exercises?.zone)
    throw new Error('Le fichier doit provenir de « Préparer les données » dans le widget.');
  const allowed=['version','year','provisional','method','exercises','previousYear','objectives',
    'goalAttainment','risks','monthly','missingDates','tools','finances'];
  const summary=Object.fromEntries(allowed.filter(k=>Object.hasOwn(payload,k)).map(k=>[k,payload[k]]));
  const response=await fetch('https://albert.api.etalab.gouv.fr/v1/chat/completions',{
   method:'POST',signal:AbortSignal.timeout(60000),
   headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model,temperature:0.1,max_completion_tokens:1400,messages:[
    {role:'system',content:'Tu rédiges en français une proposition de synthèse institutionnelle à relire. Tu utilises uniquement les agrégats fournis. Conserve les années, les nombres et leurs unités ; ne présente aucune hypothèse comme un fait. Si l’année est provisoire, indique-le. N’invente ni cause, ni recommandation, ni référence réglementaire. Signale les données absentes. Réponds en texte brut, avec des paragraphes courts et des titres sobres.'},
    {role:'user',content:JSON.stringify(summary)}
   ]})
  });
  if(!response.ok)throw new Error('Albert API a répondu HTTP '+response.status+' (vérifier clé, modèle ou quota).');
  const result=await response.json(),draft=result.choices?.[0]?.message?.content;
  if(typeof draft!=='string'||!draft.trim())throw new Error('Albert n’a pas renvoyé de texte exploitable.');
  console.log(draft.trim());
  console.error('\nBrouillon non validé : rapprocher chaque chiffre du widget avant diffusion.');
 }catch(e){console.error('Essai impossible : '+(e.name==='TimeoutError'?'délai de réponse dépassé':e.message));process.exitCode=1}
}
