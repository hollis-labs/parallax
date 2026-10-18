// Read-only, bounded response capture. Credentials stay in environment/memory.
import { createHash } from 'node:crypto'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const taskPath = '/api/v1/tasks?status=backlog%2Ctodo%2Cqueued%2Cdoing%2Creview%2Cdone%2Cblocked%2Cpaused&limit=50&sort_by=updated_at&sort_dir=desc&fields=summary'
const pick = (value, keys) => Object.fromEntries(keys.filter(k => Object.hasOwn(value, k)).map(k => [k, value[k]]))
const taskKeys = ['id','title','status','priority','manual','kind','executor','project_id','epic_id','sprint_id','parent_id','collection_id','collection_name','added_to_collections_at','created_at','updated_at']
const sessionKeys = ['id','launch_id','project_id','logical_agent_id','provider_id','provider_kind','state','created_at','updated_at','ended_at']
const numberKeys = {
  sessions: ['total','running','ended','success_pct','failure_pct','avg_seconds','recent_24h'],
  tool_calls: ['total','ok','errors','success_pct','p50_ms','p95_ms','avg_ms','recent_1h','slow_calls','sessions'],
  messages: ['total','unread','archived','recent_24h'],
  events: ['total','recent_1h','latest_seq'],
  ai: ['configured_providers','enabled_providers','routes','requests','successes','errors','budget_rejections','input_tokens','output_tokens','estimated_cost_usd'],
  catalog: ['projects','agents','providers','launches'],
}
const groupKeys = {
 sessions:['by_state','by_provider','by_project'],tool_calls:['top_tools','top_errors','by_server','latency'],messages:['by_kind','by_scope'],events:['by_scope','by_kind'],ai:['by_provider','by_model','by_event_type'],catalog:[],
}
function stamp(value) { if(typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw Error('Invalid capture timestamp'); return value }
function num(value) { if(typeof value !== 'number' || !Number.isFinite(value)) throw Error('Invalid overview number'); return value }
function text(value) { if(typeof value !== 'string') throw Error('Invalid text field'); return value }
export function projectOverview(raw) {
 const out={}
 for(const [section, keys] of Object.entries(numberKeys)) {
  if(!raw[section] || raw[section].error) throw Error(`Unavailable overview section: ${section}`)
  out[section]=Object.fromEntries(keys.map(k=>[k,num(raw[section][k])]))
  for(const k of groupKeys[section]) out[section][k]=(raw[section][k]??[]).map(v=>({name:text(v.name),count:num(v.count)}))
  if(Array.isArray(raw[section].trend)) out[section].trend=raw[section].trend.map(num)
 }
 if(raw.error || raw.health?.error) throw Error('Overview reports an error; capture refused')
 out.health={status:text(raw.health.status),catalog_root:'Path omitted from review capture'}
 return out
}
export function projectCapture(raw) {
 const tasks=raw.torque.tasks.body.items
 if(!Array.isArray(tasks)||tasks.length>50) throw Error('Expected at most 50 Torque tasks')
 const seen=new Set()
 const items=tasks.map(t=>{
  text(t.id);text(t.title);text(t.status);num(t.priority);stamp(t.created_at);stamp(t.updated_at)
  if(seen.has(t.id))throw Error('Duplicate task ID');seen.add(t.id)
  if(typeof t.manual !== 'boolean')throw Error('Invalid manual flag')
  for(const k of taskKeys) if(t[k] != null && !['string','number','boolean'].includes(typeof t[k]))throw Error(`Invalid task field: ${k}`)
  return {...pick(t,taskKeys),tags:(t.tags??[]).map(v=>({name:text(v.name),slug:text(v.slug),color:text(v.color)})),metadata:Object.fromEntries(Object.entries(pick(t.metadata??{},['tether_workstream_id','tether_workstream_status'])).map(([k,v])=>[k,text(v)]))}
 })
 const sessions=raw.tether.sessions.body.sessions
 if(!Array.isArray(sessions))throw Error('Missing Tether sessions')
 const sessionItems=[...sessions].sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at))||a.id.localeCompare(b.id)).slice(0,200).map(s=>{text(s.id);text(s.state);for(const k of sessionKeys)if(s[k]!=null)text(s[k]);return pick(s,sessionKeys)})
 const receipt=(r)=>({path:text(r.path),capturedAt:stamp(r.capturedAt)})
 const body={version:'parallax-capture/v1',capturedAt:stamp(raw.capturedAt),sources:{
  torque:{origin:new URL(raw.torque.origin).origin,tasks:{...receipt(raw.torque.tasks),items,meta:pick(raw.torque.tasks.body.meta??{},['has_more','total','returned','limit'])},scopes:(raw.torque.scopes??[]).map(s=>({kind:text(s.kind),id:text(s.id),name:text(s.name)}))},
  tether:{origin:new URL(raw.tether.origin).origin,overview:{...receipt(raw.tether.overview),body:projectOverview(raw.tether.overview.body)},sessions:{...receipt(raw.tether.sessions),items:sessionItems,returned:sessionItems.length,sourceTotal:typeof raw.tether.sessions.body.total === "number" ? raw.tether.sessions.body.total : null,truncated:sessions.length>sessionItems.length ? true : null}}
 },projection:'Task board fields, scope names, aggregate overview, and session identity/state only. Descriptions, prompts, environments, message content, tool payloads, credentials and filesystem paths are excluded. Separate GETs are not an atomic cross-service snapshot.'}
 body.id=createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0,16)
 return body
}
async function get(origin,path,token) {
 const r=await fetch(new URL(path,origin),{headers:token?{Authorization:`Bearer ${token}`}:{},signal:AbortSignal.timeout(20000),redirect:'error'})
 if(!r.ok)throw Error(`Capture GET ${path.split('?')[0]} failed: ${r.status}`)
 return {path,capturedAt:new Date().toISOString(),body:await r.json()}
}
export async function capture() {
 const torque=process.env.TORQUE_SNAPSHOT_URL??'https://torque.nanite.cloud'
 const tether=process.env.TETHER_SNAPSHOT_URL??'https://tether.nanite.cloud'
 const tasks=await get(torque,taskPath,process.env.TORQUE_API_TOKEN)
 const scopes=[]
 for(const kind of ['project','epic','sprint']) for(const id of new Set(tasks.body.items.map(t=>t[`${kind}_id`]).filter(Boolean))) {
  const r=await get(torque,`/api/v1/${kind}s/${encodeURIComponent(id)}`,process.env.TORQUE_API_TOKEN)
  scopes.push({kind,id,name:r.body.name??r.body.Name??r.body.title??r.body.Title??id})
 }
 const overview=await get(tether,'/api/overview',process.env.TETHER_SNAPSHOT_TOKEN)
 const sessions=await get(tether,'/api/sessions',process.env.TETHER_SNAPSHOT_TOKEN)
 return {capturedAt:new Date().toISOString(),torque:{origin:torque,tasks,scopes},tether:{origin:tether,overview,sessions}}
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 try {
  let raw
  if(process.argv.includes('--stdin')) {let input='';for await(const chunk of process.stdin)input+=chunk;raw=JSON.parse(input)} else raw=await capture()
  const result=projectCapture(raw), out=resolve('internal/snapshots/data/current.json')
  await mkdir(dirname(out),{recursive:true});await writeFile(out+'.tmp',JSON.stringify(result,null,2)+'\n',{mode:0o600});await rename(out+'.tmp',out)
  console.log(JSON.stringify({id:result.id,tasks:result.sources.torque.tasks.items.length,sessions:result.sources.tether.sessions.items.length,path:out}))
 } catch(e) {console.error(e.message);process.exitCode=1}
}
