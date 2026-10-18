// Extend an existing Parallax pack with a bounded, read-only Planner projection.
import { createHash } from 'node:crypto'
import { readFile, writeFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const databases = ['priorities','workstreams','roadmap','ideas','decisions','risks','inbox']
export const sections = ['in_flight','pre_flight','landed','holds']
export const textFields = ['id','title','status','tldr','created','updated','owner','phase','area','horizon','kind','severity','discuss_in','date','next_step','source','db','workstream']
export const numericFields = ['rank','order','priority']
const text = (v) => { if(typeof v !== 'string')throw Error('Invalid Planner text'); return v }
const count = (v) => { if(!Number.isSafeInteger(v)||v<0)throw Error('Invalid Planner count'); return v }
const stamp = (v) => { text(v); if(!Number.isFinite(Date.parse(v)))throw Error('Invalid Planner timestamp');return v }
function row(raw) {
  const out={id:text(raw.id),title:text(raw.title)}
  for(const key of textFields)if(raw[key]!=null)out[key]=text(raw[key])
  if(out.db!=null&&!databases.includes(out.db))throw Error('Unknown Planner database')
  for(const key of numericFields)if(raw[key]!=null){if(typeof raw[key]!=='number'||!Number.isFinite(raw[key]))throw Error('Invalid Planner number');out[key]=raw[key]}
  if(raw.mvp!=null){if(typeof raw.mvp!=='boolean')throw Error('Invalid MVP flag');out.mvp=raw.mvp}
  for(const key of ['blockers','tags'])if(raw[key]!=null){if(!Array.isArray(raw[key]))throw Error('Invalid Planner list');out[key]=raw[key].map(text)}
  if(raw.task_counts!=null)out.task_counts=Object.fromEntries(Object.entries(raw.task_counts).map(([k,v])=>[k,count(v)]))
  if(Array.isArray(raw.comments))out.comment_count=raw.comments.length
  else if(raw.comment_count!=null)out.comment_count=count(raw.comment_count)
  return out
}
function rows(raw,limit) {
  if(!Array.isArray(raw))throw Error('Missing Planner rows')
  const projected=raw.slice(0,limit).map(row),seen=new Set()
  for(const r of projected){const key=`${r.source??''}/${r.id}`;if(seen.has(key))throw Error('Duplicate Planner row');seen.add(key)}
  return projected
}
const receipt = (r) => ({path:text(r.path),capturedAt:stamp(r.capturedAt)})
export function projectPlanner(raw) {
  const lists=Object.fromEntries(databases.map(db=>{
    const r=raw.lists?.[db];if(!r)throw Error(`Missing ${db} capture`)
    const items=rows(r.body,100),total=r.sourceTotal===undefined?r.body.length:count(r.sourceTotal)
    if(total<items.length)throw Error('Planner total smaller than captured rows')
    return [db,{...receipt(r),items,sourceTotal:total,truncated:total>items.length}]
  }))
  const boards=Object.fromEntries(['curated','all'].map(scope=>{
    const r=raw.boards?.[scope];if(!r||r.body?.scope!==scope)throw Error('Planner board scope mismatch')
    const b=r.body
    for(const key of sections)if(count(b.totals[key])<rows(b.sections[key],50).length)throw Error('Planner board total smaller than captured rows')
    return [scope,{...receipt(r),body:{scope,generated_at:stamp(b.generated_at),recent_hours:count(b.recent_hours),active_hours:count(b.active_hours),limit:count(b.limit),
      sections:Object.fromEntries(sections.map(key=>[key,rows(b.sections[key],50)])),
      totals:Object.fromEntries(sections.map(key=>[key,count(b.totals[key])])),notices:(b.notices??[]).map(text)}}]
  }))
  return {origin:new URL(raw.origin).origin,capturedAt:stamp(raw.capturedAt),lists,boards}
}
async function get(origin,path,token) {
  const r=await fetch(new URL(path,origin),{headers:token?{Authorization:`Bearer ${token}`}:{},signal:AbortSignal.timeout(20000),redirect:'error'})
  if(!r.ok)throw Error(`Planner capture ${path}: ${r.status}`)
  return {path,capturedAt:new Date().toISOString(),body:await r.json()}
}
export async function capturePlanner() {
  const origin=process.env.TORQUE_SNAPSHOT_URL??'https://torque.nanite.cloud',token=process.env.TORQUE_API_TOKEN
  const lists={},boards={}
  for(const db of databases)lists[db]=await get(origin,`/api/v1/planner/${db}`,token)
  for(const scope of ['curated','all'])boards[scope]=await get(origin,`/api/v1/planner/board?scope=${scope}&limit=50`,token)
  return {origin,capturedAt:new Date().toISOString(),lists,boards}
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try {
    let raw
    if(process.argv.includes('--stdin')){let input='';for await(const c of process.stdin)input+=c;raw=JSON.parse(input)}else raw=await capturePlanner()
    const planner=projectPlanner(raw),path=resolve('internal/snapshots/data/current.json'),pack=JSON.parse(await readFile(path,'utf8'))
    if(pack.version!=='parallax-capture/v1'||!pack.sources?.torque)throw Error('Install the base Torque/Tether capture first')
    pack.sources.torque.planner=planner;pack.capturedAt=planner.capturedAt
    pack.projection='Task board fields, scope names, aggregate overview, session identities and bounded Planner summaries/boards. Full descriptions, comments, prompts, environments, message content, tool payloads, credentials and filesystem paths are excluded. Separate GETs are not an atomic cross-service snapshot.'
    delete pack.id;pack.id=createHash('sha256').update(JSON.stringify(pack)).digest('hex').slice(0,16)
    await writeFile(path+'.tmp',JSON.stringify(pack,null,2)+'\n',{mode:0o600});await rename(path+'.tmp',path)
    console.log(JSON.stringify({id:pack.id,lists:Object.fromEntries(databases.map(db=>[db,planner.lists[db].items.length]))}))
  }catch(e){console.error(e.message);process.exitCode=1}
}
