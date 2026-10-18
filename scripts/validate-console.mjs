// Reject fields outside the browser projection before accepting a downloaded capture.
export function validateConsole(data) {
 const object=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid console object');for(const key of Object.keys(value))if(!keys.includes(key))throw Error(`Unprojected console field: ${key}`)}
 const strings=(value,keys)=>{for(const k of keys)if(value[k]!=null&&typeof value[k]!=='string')throw Error(`Invalid ${k}`)}
 const receipt=['origin','path','capturedAt','cache','sourceUpdatedAt']
 const checkReceipt=r=>{strings(r,receipt);if(!Number.isFinite(Date.parse(r.capturedAt)))throw Error('Invalid console timestamp');new URL(r.origin)}
 object(data,['version','capturedAt','agents','launches','teams','fleet']);if(data.version!=='console-capture/v1'||!Number.isFinite(Date.parse(data.capturedAt)))throw Error('Unsupported console capture')
 const schemas={agents:['id','name','urn','enabled','roles','summary','skills','scopes','tools','permissionMode','sandbox','network'],launches:['id','agent','provider','project','enabled'],teams:['id','name','version','slots','coordinator','authority','history'],fleet:['id','name','provider','pid','sessionId','launchId','group','workstreamId','state','confidence','model','startedAt','lastActivity','messages','kind']}
 for(const [kind,keys] of Object.entries(schemas)){
  const r=data[kind];object(r,[...receipt,'items','sourceTotal','truncated',...(kind==='teams'?['importedAt']:kind==='fleet'?['roster','rosterTotal']:[])]);checkReceipt(r)
  if(!Array.isArray(r.items)||r.items.length>(kind==='fleet'?400:200)||!Number.isSafeInteger(r.sourceTotal)||r.sourceTotal<0||typeof r.truncated!=='boolean')throw Error('Invalid console slice')
  const ids=new Set()
  for(const row of r.items){object(row,keys);if(typeof row.id!=='string'||!row.id)throw Error('Missing identity');const id=kind==='teams'?`${row.id}@${row.version}`:row.id;if(ids.has(id))throw Error('Duplicate console identity');ids.add(id)
   strings(row,keys.filter(k=>!['enabled','network','roles','skills','scopes','tools','version','slots','pid','messages'].includes(k)))
   for(const k of ['roles','skills','scopes','tools'])if(kind==='agents'&&(!Array.isArray(row[k])||row[k].some(v=>typeof v!=='string')))throw Error('Invalid catalog list')
   for(const k of ['enabled','network'])if(row[k]!=null&&typeof row[k]!=='boolean')throw Error('Invalid flag')
   for(const k of ['pid','messages'])if(row[k]!=null&&(!Number.isFinite(row[k])||row[k]<0))throw Error('Invalid number')
   if(kind==='agents'&&(typeof row.name!=='string'||typeof row.enabled!=='boolean'))throw Error('Incomplete definition')
   if(kind==='fleet'&&(!['busy','waiting','idle','unknown'].includes(row.state)||!['process','chat'].includes(row.kind)||typeof row.name!=='string'||typeof row.group!=='string'))throw Error('Invalid activity identity')
   if(kind==='teams'){
    if(!Number.isSafeInteger(row.version)||row.version<1||!Array.isArray(row.slots)||row.slots.length>200)throw Error('Invalid team definition')
    for(const slot of row.slots){object(slot,['name','role','required','min','max','activation','resolution','definition']);strings(slot,['name','role','activation','resolution']);if(typeof slot.name!=='string')throw Error('Missing seat name');if(slot.definition){object(slot.definition,['id','revision','digest']);strings(slot.definition,['id','revision','digest'])}}
   }
  }
  if(kind==='teams'&&!Number.isFinite(Date.parse(r.importedAt)))throw Error('Invalid import time')
  if(kind==='fleet'){object(r.roster,receipt);checkReceipt(r.roster)}
 }
 return data
}
