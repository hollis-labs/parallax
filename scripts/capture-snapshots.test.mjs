import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { projectCapture } from './capture-snapshots.mjs'
const fixture=JSON.parse(readFileSync(new URL('../frontend/src/fixtures/tether-sysop.json',import.meta.url)))
function input() {
 const clock='2026-10-18T02:00:00Z'
 return {capturedAt:clock,torque:{origin:'https://torque.example',tasks:{path:'/api/v1/tasks?limit=50',capturedAt:clock,body:{items:[{id:'task-a',title:'A captured task',status:'doing',priority:2,manual:true,created_at:clock,updated_at:clock,tags:[],environment:{TOKEN:'secret'},system_prompt:'secret',metadata:{token:'secret',tether_workstream_id:'workstream-a'}}],meta:{has_more:true}}}},tether:{origin:'https://tether.example',overview:{path:'/api/overview',capturedAt:clock,body:structuredClone(fixture.overview)},sessions:{path:'/api/sessions',capturedAt:clock,body:{sessions:[{id:'session-a',launch_id:'launch-a',state:'running',workspace:'/private/path',token:'secret'}],total:100}}}}
}
test('capture keeps identity, missingness and partial coverage while excluding operational payloads',()=>{
 const raw=input(),pack=projectCapture(raw),task=pack.sources.torque.tasks.items[0]
 assert.equal(task.id,'task-a');assert.equal(task.metadata.tether_workstream_id,'workstream-a')
 assert.equal(Object.hasOwn(task,'collection_id'),false)
 assert.equal(pack.sources.torque.tasks.meta.has_more,true)
 assert.equal(pack.sources.tether.sessions.sourceTotal,100)
 assert.equal(pack.sources.tether.sessions.items[0].launch_id,'launch-a')
 assert.equal(pack.sources.tether.sessions.truncated,null)
 assert.equal(JSON.stringify(pack).includes('secret'),false)
 assert.equal(JSON.stringify(pack).includes('/private/path'),false)
 assert.equal(projectCapture(raw).id,pack.id)
 raw.torque.tasks.body.items[0].title='Changed task'
 assert.notEqual(projectCapture(raw).id,pack.id)
})
test('malformed or failed source responses cannot become healthy snapshots',()=>{
 const raw=input();raw.tether.overview.body.error='unavailable'
 assert.throws(()=>projectCapture(raw),/error/)
 delete raw.tether.overview.body.error
 raw.torque.tasks.body.items.push(raw.torque.tasks.body.items[0])
 assert.throws(()=>projectCapture(raw),/Duplicate/)
 raw.torque.tasks.body.items.pop();raw.torque.tasks.body.items[0].title={secret:'bad'}
 assert.throws(()=>projectCapture(raw),/text/)
})
