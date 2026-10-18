import {readFile,writeFile,rename} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {validateConsole} from './validate-console.mjs'
import {projectConsole} from './project-console.mjs'
// --projected accepts only the browser-side allowlisted output, already validated there.
try {
 let text='';for await(const chunk of process.stdin)text+=chunk
 const raw=JSON.parse(text)
 const data=validateConsole(process.argv.includes('--projected')?raw:projectConsole(raw))
 if(data.version!=='console-capture/v1'||!data.agents?.items||!data.fleet?.items||!Number.isFinite(Date.parse(data.capturedAt)))throw Error('Invalid console capture')
 const path='internal/snapshots/data/current.json',pack=JSON.parse(await readFile(path,'utf8'))
 if(pack.version!=='parallax-capture/v1')throw Error('Install base capture first')
 pack.sources.console=data;pack.capturedAt=data.capturedAt
 pack.projection+=' Console reference adds allowlisted Torque activity and Tether catalog/chat identities through Tachyon, including projected manually imported team versions. Prompts, environment, full paths, messages, action payloads and complete team policies are excluded. '+(data.fleet.observation?'Agents includes bounded browser-observed state transitions frozen from the live Tachyon page; earlier history and private action/wait text remain excluded.':'No historical activity stream is captured.')
 delete pack.id;pack.id=createHash('sha256').update(JSON.stringify(pack)).digest('hex').slice(0,16)
 await writeFile(path+'.tmp',JSON.stringify(pack,null,2)+'\n',{mode:0o600});await rename(path+'.tmp',path)
 console.log(JSON.stringify({id:pack.id,agents:data.agents.items.length,fleet:data.fleet.items.length,teams:data.teams.items.length}))
}catch(e){console.error(e.message);process.exitCode=1}
