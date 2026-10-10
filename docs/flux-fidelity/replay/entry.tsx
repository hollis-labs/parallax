import React from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import App from '@/App'
import '@/index.css'
import {applyTheme} from '@/lib/theme/apply'
import {NANITE_DEFAULT} from '@/lib/theme/defaults'
import {useAppStore} from '@/stores/useAppStore'
import {useLayoutStore} from '@/stores/useLayoutStore'
import {useChatStore} from '@/stores/useChatStore'
import {EnvelopeRenderer} from '@/components/chat/envelopes/EnvelopeRenderer'
import {ChatTranscript} from '@/components/chat/ChatTranscript'
import {ToolCallItem} from '@/components/chat/ToolCallItem'
import fixtures from './fixture-operands.json'
const id='fixture-session-1';useAppStore.getState().setActiveSession(id)
for(const row of fixtures.sessions){if(row.presence_operands.activeStream)useChatStore.getState().setActiveStream(row.session.id,{agentId:'fixture-agent',startedAt:fixtures.reference_time});if(row.presence_operands.pendingTool)useChatStore.getState().setPendingTool(row.session.id,{toolName:'fixture_read'})}
useLayoutStore.getState().setTheme('dark');applyTheme(NANITE_DEFAULT)
;(window as any).__fixtureControl={theme:(mode:any)=>useLayoutStore.getState().setTheme(mode),workingTab:(tab:string)=>{useLayoutStore.getState().appendChatWorkingDrawerCardTab(fixtures.drawers.card_tab as any,id);useLayoutStore.getState().setChatWorkingDrawer({open:true,height:300,activeTab:tab},id)},primaryTab:(tab:string)=>useLayoutStore.getState().setChatPrimaryDrawer({open:true,height:260,activeTab:tab}),rightTab:(tab:string)=>useLayoutStore.getState().setPanelOpen(tab,'user'),thinking:()=>{useChatStore.getState().ensureSession(id);const store=useChatStore.getState();const slice=store.sessions.get(id)!;useChatStore.setState({sessions:new Map(store.sessions).set(id,{...slice,...fixtures.thinking,textOnlyMode:true,toolCalls:fixtures.tool_calls})})}}
const params=new URLSearchParams(location.search);const mode=params.get('gallery');
if(mode==='transcript')(window as any).__fixtureControl.thinking();
const client=new QueryClient({defaultOptions:{queries:{retry:false,refetchInterval:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
function Gallery(){if(mode==='transcript'){return <div className="flex h-screen flex-col"><ChatTranscript sessionId={id} messages={fixtures.messages as any} isStreaming streamingContent="Fictional final preview"/></div>}
const index=Number(params.get('index')||0);const data=mode==='approvals'?fixtures.approvals[index].envelope:fixtures.envelopes[index][params.get('partial')==='1'?'partial':'complete'];return <main className="h-screen overflow-auto p-6"><div className="mx-auto max-w-3xl"><EnvelopeRenderer envelope={data as any} onEnvelopeResponse={async()=>{throw new Error('READONLY FIXTURE')}}/>{mode==='tools'&&fixtures.tool_calls.map(x=><ToolCallItem key={x.id} toolCall={x as any} variant="drawer"/>)}</div></main>}
createRoot(document.getElementById('root')!).render(mode?<QueryClientProvider client={client}><Gallery/></QueryClientProvider>:<App/>);
