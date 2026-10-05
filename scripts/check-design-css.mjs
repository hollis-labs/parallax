import fs from 'node:fs'
import path from 'node:path'
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)])}
const sources=files('frontend/src').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(f,'utf8')).join('\n')
const variables=[...new Set([...sources.matchAll(/var\((--[^),]+)/g)].map(m=>m[1]))]
const built=files('internal/webui/dist/assets').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(f,'utf8')).join('\n')
const missing=variables.filter(v=>!built.includes(v+':'))
if(missing.length)throw new Error('Undefined CSS variables: '+missing.join(', '))
console.log('App CSS references resolve across built CSS chunks ('+variables.length+' variables).')
