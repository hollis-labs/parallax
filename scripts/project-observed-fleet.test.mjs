import test from 'node:test'
import assert from 'node:assert/strict'
import {projectObservedFleet} from './project-observed-fleet.mjs'
import {validateConsole} from './validate-console.mjs'
const now=Date.parse('2026-10-18T16:00:00Z')
function view(){return {now,live:true,error:null,agents:[{id:'process',provider:'codex',cwd:'/private/workroot',state:'idle',stateConfidence:'exact',lastAction:{text:'secret command'},waitingFor:'secret reason',chat:{launch_id:'launch',prompt:'secret prompt'}}],history:{process:[{at:now-120000,kind:'seen',state:'busy',waitingFor:'secret reason'},{at:now-30000,kind:'state',state:'idle'}]}}}
function consoleWith(fleet){const receipt={origin:'https://tachyon.example',path:'/test',capturedAt:new Date(now).toISOString()};const slice={...receipt,items:[],sourceTotal:0,truncated:false};return {version:'console-capture/v1',capturedAt:receipt.capturedAt,agents:slice,launches:slice,teams:{...slice,importedAt:receipt.capturedAt},fleet}}
test('observed capture retains real state and observation time while excluding private context',()=>{
 const fleet=projectObservedFleet(view(),'https://tachyon.example/agents')
 validateConsole(consoleWith(fleet))
 assert.equal(fleet.items[0].history[1].at,'2026-10-18T15:59:30.000Z')
 assert.equal(fleet.items[0].history[1].state,'idle')
 assert.equal(fleet.items[0].group,'workroot')
 const json=JSON.stringify(fleet)
 for(const excluded of ['secret','/private','lastAction','waitingFor','prompt'])assert.equal(json.includes(excluded),false)
})
test('disconnected or stale source views cannot be presented as healthy observations',()=>{
 assert.throws(()=>projectObservedFleet({...view(),live:false},'https://tachyon.example'),/healthy/)
 assert.throws(()=>projectObservedFleet({...view(),error:'stale'},'https://tachyon.example'),/healthy/)
})
test('download validation rejects private fields, reversed time and inconsistent captured state',()=>{
 const fleet=projectObservedFleet(view(),'https://tachyon.example')
 const copy=()=>structuredClone(fleet)
 let invalid=copy();invalid.items[0].history[0].waitingFor='secret';assert.throws(()=>validateConsole(consoleWith(invalid)),/Unprojected/)
 invalid=copy();invalid.items[0].history.reverse();assert.throws(()=>validateConsole(consoleWith(invalid)),/transition/)
 invalid=copy();invalid.items[0].history[1].at=new Date(now+1).toISOString();assert.throws(()=>validateConsole(consoleWith(invalid)),/transition/)
 invalid=copy();invalid.items[0].state='busy';assert.throws(()=>validateConsole(consoleWith(invalid)),/captured state/)
 invalid=copy();delete invalid.observation;assert.throws(()=>validateConsole(consoleWith(invalid)),/history/)
})
