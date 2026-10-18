import test from 'node:test'
import assert from 'node:assert/strict'
import {databases, sections, projectPlanner} from './capture-planner.mjs'
const now='2026-10-18T03:00:00Z'
function input(){
  const receipt=body=>({path:'/test',capturedAt:now,body})
  return {origin:'https://torque.example',capturedAt:now,
    lists:Object.fromEntries(databases.map(db=>[db,receipt([{id:'one',title:'Example',status:'active',comments:[{body:'private comment'}],description:'private body',token:'secret',tags:['board']}])])),
    boards:Object.fromEntries(['curated','all'].map(scope=>[scope,receipt({scope,generated_at:now,recent_hours:48,active_hours:24,limit:50,sections:Object.fromEntries(sections.map(s=>[s,[]])),totals:Object.fromEntries(sections.map(s=>[s,0])),notices:[]})]))}
}
test('projection retains useful summaries and excludes bodies and unknown fields',()=>{
  const row=projectPlanner(input()).lists.priorities.items[0]
  assert.equal(row.comment_count,1);assert.deepEqual(row.tags,['board'])
  for(const key of ['comments','description','token'])assert.equal(key in row,false)
})
test('bounded captures retain actual source total and disclose truncation',()=>{
  const raw=input(); raw.lists.ideas.body=Array.from({length:105},(_,i)=>({id:String(i),title:'Idea'}))
  const list=projectPlanner(raw).lists.ideas
  assert.equal(list.items.length,100);assert.equal(list.sourceTotal,105);assert.equal(list.truncated,true)
})
test('malformed, incomplete and ambiguous captures fail instead of inventing data',()=>{
  for(const mutate of [r=>delete r.lists.risks,r=>r.lists.ideas.body.push(r.lists.ideas.body[0]),r=>r.boards.curated.body.scope='all',r=>r.lists.ideas.body[0].db='unknown',r=>r.capturedAt='bad',r=>r.boards.all.body.sections.holds=[{id:'x',title:'Uncounted'}]]){
    const raw=input();mutate(raw);assert.throws(()=>projectPlanner(raw))
  }
})
