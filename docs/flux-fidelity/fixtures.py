"""Author deterministic fictional operands; no API, producer or wire changes.

Usage: python3 docs/flux-fidelity/fixtures.py /path/to/go-envelopes-v0.4.0
Complete data uses the primary manifest's required fields. Partial operands
deliberately violate required-data completeness and are UI robustness specimens.
"""
from pathlib import Path
import sys, re, json, hashlib

out=Path(__file__).parent
source=Path(sys.argv[1])
clock='2026-10-04T14:30:00Z'
manifest=(source/'manifest/envelopes.yaml').read_text()
names=re.findall(r'^  - type: (.+)$',manifest.split('core:')[1],re.M)
complete={
 'document-viewer':{'title':'Fixture field notes','content':'# Review\n\nFictional notes, **never customer data**.','format':'markdown','sections':['Summary']},
 'report-card':{'title':'Fixture report','generated_at':clock,'metrics':[{'label':'Review progress','value':'42%','percent':42}],'summary':'Fictional preparation only.'},
 'error-report':{'code':'fixture_unavailable','message':'Fictional adapter unavailable','giphy_query':'','timestamp':clock,'details':{'fixture_note':'No real provider was called.'}},
 'approval-card':{'description':'Inspect fictional notes','risk_level':'low','details':'Local specimen only.'},
 'proposal-card':{'type':'create_task','payload':{'title':'Fictional review','description':'Inert proposal.'},'schema':{'title':{'type':'string','label':'Title','required':True}}},
 'info-card':{'title':'Fixture information','body':'Fictional operands use a fixed reference clock.','variant':'info'},
 'list-card':{'title':'Fixture checklist','items':[{'id':'fixture-todo-1','label':'Review capture','status':'pending'},{'id':'fixture-todo-2','label':'Read source','status':'done'}]},
 'metric-card':{'label':'Fixture progress','value':'42','unit':'%','trend':'up','previous':'40','description':'Authored value, not measured runtime.'},
 'progress-card':{'title':'Fixture preparation','progress':42,'status':'Reviewing','steps':[{'label':'Source read','done':True},{'label':'Owner confirmation','done':False}]},
 'confirmation-card':{'title':'Fixture confirmation','message':'Confirm fictional preview?','risk':'low','confirm_label':'Confirm','cancel_label':'Cancel'},
 'table-card':{'title':'Fixture records','columns':[{'key':'name','label':'Name','sortable':True},{'key':'state','label':'State'}],'rows':[{'name':'Fictional record A','state':'pending'},{'name':'Fictional record B','state':'done'}]},
 'timeline-card':{'title':'Fixture timeline','events':[{'timestamp':'2026-10-04T14:10:00Z','label':'Source read','status':'completed'},{'timestamp':clock,'label':'Review pending','status':'active'}]},
 'diff-card':{'title':'Fixture difference','before':{'label':'Before','content':'old fictional copy'},'after':{'label':'After','content':'new fictional copy'},'format':'text'},
 'artifact-mini':{'artifact_id':'fixture-artifact-1','name':'fictional-notes.md','mime_type':'text/markdown','size_bytes':128,'origin':'fixture'},
 'session-task':{'task_id':'fixture-task-1','title':'Fictional preparation','status':'pending'},
 'subagent-spawn-approval':{'run_id':'fixture-run-1','role':'fixture-reviewer','prompt':'Read fictional notes. Do not start a model.','mode':'sync','risk_level':'medium'},
 'chat-loop-terminated':{'reason':'Fictional iteration ceiling','code':'max_turns','iteration':3,'consecutive_failures':0,'timestamp':clock},
 'elicitation-prompt':{'elicitation_id':'fixture-elicitation-1','message':'Inspect fictional notes?','schema_type':'boolean','origin':'server','timeout_at':'2026-10-04T14:35:00Z'},
}
envelopes=[]
for name in names:
 schema=json.loads((source/f'manifest/schemas/{name}.schema.json').read_text())
 # Deliberate partial: retain only a human heading/description when available.
 partial={k:v for k,v in complete[name].items() if k in ('title','description','label','message')}
 # Ensure even heading-only schemas retain a genuine required-field omission.
 if all(k in partial for k in schema.get('required',[])) and schema.get('required'):
  partial.pop(schema['required'][-1],None)
 envelopes.append({'type':name,'schema_source':f'manifest/schemas/{name}.schema.json','schema_sha256':hashlib.sha256((source/f'manifest/schemas/{name}.schema.json').read_bytes()).hexdigest(),'required':schema.get('required',[]),'complete':{'kind':'envelope','version':1,'id':'fixture-'+name+'-complete','type':name,'data':complete[name]},'partial':{'kind':'envelope','version':1,'id':'fixture-'+name+'-partial','type':name,'data':partial},'partial_is_wire_valid':False,'render_expectation':'unsupported fallback; no frontend component' if name=='session-task' else 'observe native result; empty/fallback/failure is evidence, not assumed graceful success'})

states=['idle','online','working','pending_action','failed','halted','stopped','archived']
kinds=['api','cli','durable','api','cli','durable','cli','durable']
sessions=[]
for i,(state,kind) in enumerate(zip(states,kinds)):
 id=f'fixture-session-{i+1}'
 session={'id':id,'short_code':f'f{i+1}','title':f'Fictional {kind} / {state}','custom_name':'','project_id':'fixture-project','context_type':'durable_agent' if kind=='durable' else None,'context_id':f'fixture-durable-{i+1}' if kind=='durable' else None,'provider':'pty-codex' if kind=='cli' else 'fixture','model':'fictional-model','status':state if state in ('failed','stopped','archived') else 'active','runtime_state':'running' if state=='online' else 'failed' if state=='failed' else None,'halted_at':clock if state=='halted' else None,'halted_reason':'Fictional halt' if state=='halted' else None,'is_pinned':i==0,'sort_order':i,'message_count':3,'tags':'[]','last_activity':f'2026-10-04T14:{20-i:02d}:00Z','created_at':'2026-10-04T13:00:00Z','metadata':'{}'}
 sessions.append({'kind':kind,'activity':state,'session':session,'presence_operands':{'activeStream':state=='working','pendingTool':state=='pending_action','cliActive':False},'reference_age_minutes':10+i})

messages=[{'id':'fixture-message-1','session_id':'fixture-session-1','agent_id':'fixture-agent','role':'user','content':'Review the **fictional** fixture.\n\n- Markdown list\n- `inline code`\n\n```ts\nconst seed = 4421\n```','envelope':None,'metadata':'{"compacted":true}','created_at':'2026-10-04T14:10:00Z'}, {'id':'fixture-message-2','session_id':'fixture-session-1','agent_id':'fixture-agent','role':'assistant','content':'# Fixture review\n\n| Item | State |\n|---|---|\n| Source | Read |\n\n> Fictional operands only.\n\nA deliberatelylongunbrokenidentifierforwrappingandnarrowviewportreview.','envelope':None,'metadata':'{}','created_at':'2026-10-04T14:20:00Z'}, {'id':'fixture-message-3','session_id':'fixture-session-1','agent_id':'fixture-agent','role':'assistant','content':'Fictional information card.','envelope':json.dumps(envelopes[names.index('info-card')]['complete']),'metadata':'{}','created_at':'2026-10-04T14:25:00Z'}]

approvals=[]
for flavor in ('approval-card','subagent-spawn-approval'):
 for risk in ('low','medium','high'):
  for decision in ('pending','approved','rejected'):
   id=f'fixture-{flavor}-{risk}-{decision}'
   e={'kind':'envelope','version':1,'id':id,'type':flavor,'data':{**complete[flavor],'risk_level':risk}}
   if decision!='pending':
    rejected=decision=='rejected'
    e['prior_response']={'v':1,'kind':flavor,'id':id,'status':'canceled' if rejected and flavor=='subagent-spawn-approval' else 'submitted','data':{'reason':'Fictional rejection'} if rejected and flavor=='subagent-spawn-approval' else {'approved':not rejected}}
   approvals.append({'risk':risk,'decision':decision,'envelope':e})

widgets={'session-info':{'source':'selected fictional session and fixture-project; named fixture agent'},'context-budget':{'context_window':32000,'used':8000,'breakdown':{'system':2000,'history':5000,'tools':1000}},'token-usage':{'input_tokens':5000,'output_tokens':3000,'total_tokens':8000,'cost':0,'cost_label':'fictional zero, not unknown'},'observability':{'sampled_at':clock,'executions':[{'id':'fixture-execution-1','status':'completed','duration_ms':120}]},'tools':{'tools':[{'name':'fixture_read','description':'Inert fixture only','input_schema':{'type':'object'}}],'servers':[{'name':'fixture-server','tool_count':1,'connected':False}]},'agent-status':{'agent_id':'fixture-agent','status':'idle'},'worker-status':{'workers':[{'id':'fixture-worker','status':'idle','task':'Fictional preparation'}]},'bookmarks':{'records':[],'evidence_state':'known_empty'},'unavailable':{'records':None,'evidence_state':'unavailable','reason':'fixture adapter does not supply this slice'},'unknown':{'records':None,'evidence_state':'unknown','reason':'no fictional operand declared'},'partial':{'records':[{'id':'fixture-partial-widget'}],'evidence_state':'partial','missing':['status','sampled_at']}}
drawers={'working':['scratchpad','terminal-1','terminal-2','artifacts','runtime','session-context','card:fixture-info-card'],'right':['widgets','work','workflows','inbox','artifacts'],'primary':['documents','reports','diffs','tools','pins','pin:fixture-pinned-card'], 'pinned_content_kinds':['markdown','image','diff','scratchpad','artifact-mini','agent-envelope'],'card_tab':{'id':'card:fixture-info-card','label':'Fixture information','payload':envelopes[names.index('info-card')]['complete'],'pinned':False,'createdAt':1791124200000},'terminal_commands':'inert strings only; never shell execution','runtime':'explicit unavailable unless local host-feed fixture is supplied'}
result={'purpose':'proposed operands for CW-20261010-0083; no product-count guarantee','seed':4421,'reference_time':clock,'schema_reference':'github.com/hollis-labs/go-envelopes v0.4.0 authored manifest','sessions':sessions,'messages':messages,'thinking':{'session_id':'fixture-session-1','streamingThinking':'Fictional reasoning preview','streamingNarration':'Reading fictional operands','streamingFinal':'**Fictional** final preview','isStreaming':True},'text_only':True,'tool_calls':[{'id':'fixture-tool-'+status,'tool':'fixture_read','status':status,'summary':'Fictional '+status,'detail':'No execution occurred.'} for status in ('running','done','error')],'envelopes':envelopes,'approvals':approvals,'widgets':widgets,'drawers':drawers}
(out/'fixture-operands.json').write_text(json.dumps(result,indent=2)+'\n')
print('Authored deterministic operands for '+', '.join(names))
