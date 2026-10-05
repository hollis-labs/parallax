import fs from 'node:fs'
const manifest=JSON.parse(fs.readFileSync('internal/webui/dist/.vite/manifest.json','utf8'))
const entry=Object.entries(manifest).find(([,value])=>value.isEntry)?.[0]
if(!entry)throw new Error('Missing application entry')
function closure(key,seen=new Set()){if(seen.has(key))return seen;seen.add(key);for(const child of manifest[key]?.imports??[])closure(child,seen);return seen}
const heavy=['src/developer/Output.tsx','src/developer/Workflow.tsx']
const core=closure(entry)
for(const path of [...heavy,'src/developer/Lab.tsx'])if(core.has(path))throw new Error('Core eagerly imports optional presentation '+path)
for(const path of heavy)if(!manifest[path]?.isDynamicEntry)throw new Error('Missing independently lazy optional entry '+path)
const developer=closure('src/developer/Lab.tsx')
for(const path of heavy)if(developer.has(path))throw new Error('Source eagerly imports heavy optional entry '+path)
if(Object.keys(manifest).some(key=>/highlight|shiki/i.test(key)))throw new Error('Unadopted highlighting entered app build')
console.log('Manifest proves core/source avoid independent Output and Workflow entries; highlighting unadopted.')
