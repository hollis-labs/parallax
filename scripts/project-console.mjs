// Read-only, allowlisted projection of Tachyon's Torque/Tether-backed console reads.
// This function also runs inside an authorized browser before any data is downloaded.
export function projectConsole(raw) {
  const text=(v)=>{if(typeof v!=='string')throw Error('Invalid console text');return v}
  const optional=(v)=>v==null?undefined:text(v)
  const texts=(v)=>v==null?[]:Array.isArray(v)?v.map(text):(()=>{throw Error('Invalid console list')})()
  const bool=(v)=>v==null?undefined:typeof v==='boolean'?v:(()=>{throw Error('Invalid console flag')})()
  const number=(v)=>v==null?undefined:typeof v==='number'&&Number.isFinite(v)&&v>=0?v:(()=>{throw Error('Invalid console number')})()
  const stamp=(v)=>{text(v);if(!Number.isFinite(Date.parse(v)))throw Error('Invalid capture time');return v}
  const receipt=(r)=>({origin:new URL(r.origin).origin,path:text(r.path),capturedAt:stamp(r.capturedAt),cache:optional(r.cache),sourceUpdatedAt:optional(r.sourceUpdatedAt)})
  const rows=(r,key,project)=>{const all=r.body[key];if(!Array.isArray(all))throw Error(`Missing ${key}`);const items=all.slice(0,200).map(project);const ids=items.map(a=>a.version===undefined?a.id:`${a.id}@${a.version}`);if(new Set(ids).size!==ids.length)throw Error(`Duplicate ${key} identity`);return {...receipt(r),items,sourceTotal:all.length,truncated:all.length>items.length}}
  const launches=rows(raw.launches,'launches',l=>({id:text(l.id),agent:text(l.agent),provider:optional(l.provider),project:optional(l.project),enabled:bool(l.enabled)}))
  const agents=rows(raw.agents,'agents',a=>({id:text(a.id),name:optional(a.name)||a.id,urn:optional(a.urn),enabled:bool(a.enabled)??true,roles:texts(a.roles),summary:optional(a.description),skills:texts(a.skills),scopes:texts(a.mcp_scopes),tools:texts(a.mcp?.servers),permissionMode:optional(a.permissions?.permission_mode),sandbox:optional(a.permissions?.default_sandbox),network:bool(a.permissions?.network)}))
  const teams=rows(raw.teams,'teams',t=>({id:text(t.id),name:text(t.name),version:number(t.version),slots:(t.slots??[]).map(s=>({name:text(s.name),role:optional(s.role),required:bool(s.required),min:number(s.min),max:number(s.max),activation:optional(s.activation),resolution:optional(s.resolution),definition:s.definition_ref?{id:text(s.definition_ref.id),revision:text(s.definition_ref.revision),digest:optional(s.definition_ref.digest)}:undefined})),coordinator:optional(t.routing?.coordinator_slot),authority:optional(t.authority?.mode),history:optional(t.policy?.history)}))
  teams.importedAt=stamp(raw.teams.body.imported_at)
  // Join chat identities before removing filesystem paths. Never join by display name.
  if(!Array.isArray(raw.fleet.body.agents)||!Array.isArray(raw.roster.body.agents))throw Error('Missing fleet or roster')
  const processes=raw.fleet.body.agents.slice(0,200)
  const fleetItems=processes.map(a=>({id:text(a.id),provider:optional(a.provider)||'unknown',pid:number(a.pid),sessionId:optional(a.session_id),name:typeof a.cwd==='string'?a.cwd.split('/').filter(Boolean).at(-1)||a.provider:a.provider,group:optional(a.workstream_name)||optional(a.workstream_id)||(typeof a.cwd==='string'?a.cwd.split('/').filter(Boolean).at(-1):undefined)||'Unassigned',workstreamId:optional(a.workstream_id),state:['busy','waiting','idle','unknown'].includes(a.state)?a.state:'unknown',confidence:optional(a.confidence?.state),model:optional(a.model),startedAt:optional(a.started_at),lastActivity:optional(a.last_activity),messages:number(a.unread_messages??a.messages),kind:'process'}))
  for(const chat of raw.roster.body.agents.slice(0,200)){
    const id=text(chat.launch_id),name=text(chat.display_name),session=chat.session
    const candidates=session?processes.map((p,i)=>p.session_id===session.id||p.id===session.id||(typeof p.cwd==='string'&&p.cwd.endsWith(`/.tether-worker/workspaces/${session.id}/workroot`))?i:-1).filter(i=>i>=0):[]
    const joined=candidates.length===1?fleetItems[candidates[0]]:undefined
    if(joined){joined.name=name;joined.kind='chat';joined.launchId=id}
    else fleetItems.push({id:`chat:${id}`,name,launchId:id,provider:'tether',sessionId:optional(session?.id),group:'tether',kind:'chat',state:session?.state==='running'?(session.at_turn_boundary?'waiting':'busy'):'unknown',lastActivity:optional(session?.last_activity_at),confidence:'exact'})
  }
  if(new Set(fleetItems.map(a=>a.id)).size!==fleetItems.length)throw Error('Duplicate fleet identity')
  return {version:'console-capture/v1',capturedAt:stamp(raw.capturedAt),agents,launches,teams,fleet:{...receipt(raw.fleet),items:fleetItems,sourceTotal:raw.fleet.body.agents.length,rosterTotal:raw.roster.body.agents.length,truncated:raw.fleet.body.agents.length>200||raw.roster.body.agents.length>200,roster:receipt(raw.roster)}}
}
