import { readFile, writeFile, rename } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { validateConsole } from './validate-console.mjs'
// stdin is already projected inside the authorized source browser.
try {
  let input=''; for await (const chunk of process.stdin) input+=chunk
  const fleet=JSON.parse(input)
  const path='internal/snapshots/data/current.json'
  const pack=JSON.parse(await readFile(path,'utf8'))
  const consoleData=validateConsole({...pack.sources.console, capturedAt:fleet.capturedAt, fleet})
  if(!fleet.observation)throw Error('Missing observation provenance')
  pack.sources.console=consoleData
  pack.capturedAt=fleet.capturedAt
  pack.projection=pack.projection.replace('No historical activity stream is captured.', 'Agents includes bounded browser-observed state transitions frozen from the live Tachyon page; earlier history and private action/wait text remain excluded.')
  delete pack.id;pack.id=createHash('sha256').update(JSON.stringify(pack)).digest('hex').slice(0,16)
  await writeFile(path+'.tmp',JSON.stringify(pack,null,2)+'\n',{mode:0o600});await rename(path+'.tmp',path)
  console.log(JSON.stringify({id:pack.id,agents:fleet.items.length,withHistory:fleet.items.filter(a=>a.history?.length).length,capturedAt:fleet.capturedAt}))
} catch(e) { console.error(e.message);process.exitCode=1 }
