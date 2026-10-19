const $ = (s)=>document.querySelector(s);
const esc = (s)=>String(s??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = (s)=>String(s||'').replace(/[^a-z0-9_-]/gi,'');
let index={current:[],messages:[],archives:[]}, view='feed', archive=null, search='';
const ROOT='./';
// Inventaire direct du depot public : evite un index.json perime en mode Pages /branch.
const GITHUB_TREE='https://api.github.com/repos/AeternaGlacies/testVamp/git/trees/main?recursive=1';
function fromGitTree(entries){
 const allowed=/\.(txt|png|jpg|jpeg|gif|webp)$/i;
 const normalize=p=>({path:p,title:p.split('/').pop().replace(/\.[^.]+$/,'').replace(/[_-]/g,' ')});
 const paths=entries.filter(e=>e.type==='blob'&&e.path.startsWith('contenu/')&&allowed.test(e.path)).map(e=>e.path);
 const byFolder=(folder)=>paths.filter(p=>p.slice(0,p.lastIndexOf('/')+1)===folder).sort((a,b)=>a.localeCompare(b,'fr',{numeric:true})).map(normalize);
 const nums=[...new Set(paths.map(p=>p.match(/^contenu\/archives\/(\d+)\//)?.[1]).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));
 return {current:byFolder('contenu/semaine/'), messages:byFolder('contenu/messages/'),archives:nums.map(n=>({id:n,title:'Semaine '+n,files:byFolder('contenu/archives/'+n+'/')}))};
}
async function liveGithubIndex(){
 if(location.hostname!=='aeternaglacies.github.io')return null;
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),5000);
 try{const r=await fetch(GITHUB_TREE,{signal:controller.signal,cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
 if(!r.ok)throw Error('GitHub '+r.status);const tree=await r.json();if(tree.truncated||!Array.isArray(tree.tree))throw Error('Inventaire incomplet');return fromGitTree(tree.tree);
 }finally{clearTimeout(timeout)}
}

function safePath(p){if(typeof p!=='string'||p.startsWith('/')||p.includes('..')||p.includes('\\')||!/^contenu\/[\wÀ-ÿ .()\-\/]+\.(txt|png|jpg|jpeg|gif|webp)$/i.test(p))return null;return ROOT+p.split('/').map(encodeURIComponent).join('/');}
async function getText(file){const url=safePath(file);if(!url)throw Error('Chemin invalide');const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Fichier inaccessible');return r.text()}
function friendly(file){return file.split('/').pop().replace(/\.[^.]+$/,'').replace(/[_-]/g,' ')}
// Format: couleur_nom_qui.ext (ex. rouge_Sirop_Marie Tremblay.txt).
// Le premier champ donne la couleur, le deuxieme le titre, le dernier l'auteur.
const AUTHOR_COLORS={rouge:'#9b233d',bleu:'#2866a0',vert:'#287d61',jaune:'#9b6b13',orange:'#b55d2e',violet:'#7447a4',rose:'#a94175',noir:'#33343a',gris:'#74777e',brun:'#75513d',blanc:'#b7b7b7'};
function fileIdentity(file){
 const base=decodeURIComponent(file.split('/').pop()||'').replace(/\.[^.]+$/,'');
 const parts=base.split('_');const candidate=parts[0]?.toLocaleLowerCase('fr');
 if(parts.length<3||!Object.hasOwn(AUTHOR_COLORS,candidate))return {color:'gris',title:friendly(file),author:'Membre du réseau',custom:false};
 const title=parts.slice(1,-1).join(' ').replace(/-/g,' ').trim();
 const author=parts.at(-1).replace(/-/g,' ').trim();
 if(!title||!author)return {color:'gris',title:friendly(file),author:'Membre du réseau',custom:false};
 return {color:candidate,title,author,custom:true};
}
function avatar(who='Membre du réseau',color='gris'){
 const initials=who.trim().split(/\s+/).slice(0,2).map(w=>w.charAt(0).toLocaleUpperCase('fr')).join('')||'●';
 return `<span class="avatar person-avatar" style="--person-color:${AUTHOR_COLORS[color]||AUTHOR_COLORS.gris}" aria-label="${esc(who)}">${esc(initials)}</span>`;
}
async function card(item,source='current'){
 const file=item.path||'';const identity=fileIdentity(file);const title=identity.title;const ext=file.split('.').pop().toLowerCase();const isImage=/^(png|jpg|jpeg|gif|webp)$/.test(ext);let content='';
 if(isImage){const url=safePath(file);content=url?`<img class="post-media" loading="lazy" src="${esc(url)}" alt="${esc(title)}">`:'<div class="empty">Image non disponible</div>'}
 else{try{content=`<div class="post-body">${esc(await getText(file))}</div>`}catch{content='<div class="post-body">Ce document ne peut pas être chargé.</div>'}}
 if(source==='current')return `<article class="card"><div class="post-head">${avatar(identity.author,identity.color)}<div><div class="post-author">${esc(identity.author)}</div><div class="meta">${esc(title)} · Publication de la semaine</div></div></div>${content}<div class="post-footer"><span>Accessible aux membres du réseau</span><span>●</span></div></article>`;
 return `<article class="card info-card"><div class="post-head">${avatar(identity.author,identity.color)}<div><div class="post-author">${esc(identity.author)}</div><div class="meta">${esc(title)} · ${source==='messages'?'Information partagée':'Archive du réseau'}</div></div></div>${isImage?content:`<div class="file-body">${content.replace(/^<div class="post-body">|<\/div>$/g,'')}</div>`}</article>`;
}
const matches=(item)=>!search||`${item.title||''} ${item.path||''}`.toLocaleLowerCase('fr').includes(search);
async function buildCards(items,source){return (await Promise.all(items.filter(matches).map(x=>card(x,source)))).join('')||'<div class="card empty">Aucun fichier à afficher pour le moment.</div>'}
async function render(){const el=$('#view');const thisView=view;const thisArchive=archive;const titles={feed:'Fil d’actualité',messages:'Messages du réseau',archives:'Archives',profile:'Mon profil'};$('#page-title').textContent=titles[view];document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));el.innerHTML='<div class="card empty">Chargement des informations…</div>';let html='';
 if(view==='feed')html=`<div class="card intro"><h2>Cette semaine dans le réseau</h2><p>Les publications visibles ici sont les images et les fichiers texte déposés dans le dossier de la semaine en cours.</p></div><div class="section-title"><span>FIL D’ACTUALITÉ</span><span>${index.current.length} FICHIERS</span></div>`+await buildCards(index.current,'current');
 if(view==='messages')html=`<div class="card intro"><h2>Informations connues</h2><p>Ces renseignements ont été recueillis et sont désormais connus de tous les membres du réseau Saguenay.</p></div><div class="section-title"><span>INFORMATIONS PARTAGÉES</span><span>${index.messages.length} DOCUMENTS</span></div>`+await buildCards(index.messages,'messages');
 if(view==='archives'){if(thisArchive){const a=index.archives.find(x=>x.id===thisArchive);html=`<button class="back" id="back">← Retour aux archives</button><div class="card intro"><h2>${esc(a?.title||'Archive')}</h2><p>Publications conservées des semaines précédentes.</p></div>`+(a?await buildCards(a.files,'archive'):'<div class="card empty">Archive introuvable.</div>')}else{html=`<div class="card intro"><h2>Historique des semaines</h2><p>Chaque dossier numéroté contient les publications archivées manuellement par le maître de jeu.</p></div>`+(index.archives.filter(a=>!search||`${a.title} ${a.id}`.toLowerCase().includes(search)).map(a=>`<div class="card"><button class="archive-item" data-archive="${esc(a.id)}"><span class="archive-symbol">▤</span><span><strong>${esc(a.title)}</strong><small>${a.files.length} fichier(s)</small></span><span style="margin-left:auto">›</span></button></div>`).join('')||'<div class="card empty">Aucune ancienne semaine archivée.</div>')}}
 if(view==='profile')html='<div class="card"><div class="profile-banner"></div><div class="profile-details">'+avatar()+'<h2>Membre du réseau</h2><p>Profil générique · Réseau Saguenay</p></div></div><div class="card info-card"><h2>Accès partagé</h2><p>Tout le monde utilise le même profil fictif. Aucune connexion individuelle, aucun mot de passe, aucune progression personnelle.</p></div>';
 if(view===thisView&&archive===thisArchive)el.innerHTML=html;
}
function navigate(next){view=next;archive=null;search='';$('#search').value='';render();window.scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.view)navigate(b.dataset.view);if(b.dataset.archive){archive=b.dataset.archive;render();window.scrollTo(0,0)}if(b.id==='back'){archive=null;render()}});
$('#search').addEventListener('input',e=>{search=e.target.value.trim().toLocaleLowerCase('fr');render()});
async function start(){
 try{
  let data=null;
  try{data=await liveGithubIndex()}catch(error){console.warn('Inventaire GitHub indisponible; utilisation de index.json',error)}
  if(!data){const r=await fetch('./data/index.json',{cache:'no-store'});if(!r.ok)throw Error('index');data=await r.json()}
  index={current:Array.isArray(data.current)?data.current:[],messages:Array.isArray(data.messages)?data.messages:[],archives:Array.isArray(data.archives)?data.archives:[]};await render();
 }catch(error){console.error(error);$('#view').innerHTML='<div class="card info-card error"><h2>Publications indisponibles</h2><p>Vérifie la publication GitHub Pages et le dossier <code>contenu/semaine/</code>. L’index du dépôt est inaccessible.</p></div>'}
}
start();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
