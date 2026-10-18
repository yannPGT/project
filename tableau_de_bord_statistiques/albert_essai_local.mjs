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
  if(payload.version!==2||!['2024','2025','2026'].includes(String(payload.year))||
     !payload.exercises?.department||!payload.exercises?.zone)
    throw new Error('Le fichier doit provenir de « Préparer les données » dans le widget.');
  const allowed=['version','year','generatedAt','currentYearIncomplete','dataQuality','method','exercises',
    'previousYear','qualitativeObjectives','quantitativeTerritoryTargets','riskCategoryCounts','commandChainAlerts','unresolvedPostures',
    'monthlyRealizedCounts','recordedToolFlags','financeObservations'];
  const summary=Object.fromEntries(allowed.filter(k=>Object.hasOwn(payload,k)).map(k=>[k,payload[k]]));
  const response=await fetch('https://albert.api.etalab.gouv.fr/v1/chat/completions',{
   method:'POST',signal:AbortSignal.timeout(60000),
   headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model,temperature:0.1,max_completion_tokens:1800,messages:[
    {role:'system',content:"Tu rédiges un BROUILLON de synthèse annuelle institutionnelle en français à partir des seuls agrégats JSON. Commence directement par un titre et six parties brèves : volumes ; objectifs quantitatifs territoriaux ; orientations qualitatives de la circulaire ; risques ; calendrier et dispositifs ; finances et limites. Interprète quantitativeTerritoryTargets exclusivement comme des territoires atteignant un seuil annuel de nombre d’exercices ; ne les présente jamais comme un pourcentage des objectifs qualitatifs. Les objectifs qualitatifs listent les orientations, sans indicateur de réalisation individuel : ne déduis aucun taux d’atteinte qualitatif. FR-Alert est un dispositif d’alerte à la population, jamais « FR (France) ». Les indicateurs d’outils sont des cases renseignées ; leur absence ne démontre pas une non-utilisation. Les montants financiers sont des champs enregistrés ; ne calcule pas un taux de financement, n’affirme pas un déficit, une sous-dotation, un besoin non couvert ni un risque futur. Une année échue ne signifie pas des données complètes ; les fiches encore marquées « programmées » ne sont pas des exercices à venir. Aucune causalité saisonnière ni conclusion sur la capacité opérationnelle sans preuve externe. N’invente ni chiffres, ni calculs, ni jugement, ni recommandation, ni référence réglementaire. Si tu calcules une évolution, indique son dénominateur, vérifie-la et emploie une formulation purement descriptive. Les alertes de la chaîne de commandement ont leurs propres compteurs : ne les additionne pas aux totaux des exercices ordinaires. Les objectifs d’un même alternativeGroup sont des alternatives et non des obligations cumulatives. Mentionne les postures non résolues comme limite de source. Décris les limites de source et indique qu’une validation humaine reste requise. Rends du texte brut, sans introduction commerciale."},
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
