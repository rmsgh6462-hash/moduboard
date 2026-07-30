"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Download, ImagePlus, Plus, Sparkles } from "lucide-react";
import { addEdge, Background, BackgroundVariant, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type Connection, type Edge, type Node, type NodeProps, type ReactFlowInstance, useEdgesState, useNodesState } from "@xyflow/react";
import { toBlob } from "html-to-image";
import { PostModal } from "@/components/board/post-modal";
import { ModernPostCard } from "@/components/board/modern-post-card";
import { uploadBoardFile } from "@/lib/storage/upload-board-file";
import type { Board, Group, Post, UserProfile } from "@/types/database";

type IdeaData = { label:string; root:boolean };
type IdeaNode = Node<IdeaData,"idea">;
type IdeaEdge = Edge;
type IdeaNodeViewProps = NodeProps<IdeaNode> & { onLabelChange:(id:string,label:string)=>void; onAddChild:(id:string)=>void };

function IdeaNodeView({id,data,onLabelChange,onAddChild}:IdeaNodeViewProps){return <div className={`flow-idea-node ${data.root?"root":""}`}><Handle type="target" position={Position.Left} isConnectable={!data.root}/><textarea className="nodrag" value={data.label} onChange={event=>onLabelChange(id,event.target.value)} aria-label={data.root?"중앙 주제":"아이디어"} rows={3}/><button className="nodrag" type="button" onClick={()=>onAddChild(id)} aria-label="하위 생각 추가"><Plus/></button><Handle type="source" position={Position.Right}/></div>}

export function MindmapBoard({board,group,profile,initialPosts}:{board:Board;group:Group;profile:UserProfile;initialPosts:Post[]}){
  const [nodes,setNodes,onNodesChange]=useNodesState<IdeaNode>([{id:"root",type:"idea",position:{x:460,y:260},data:{label:board.title||"우리의 중심 주제",root:true},deletable:false}]);
  const [edges,setEdges,onEdgesChange]=useEdgesState<IdeaEdge>([]);
  const [posts,setPosts]=useState(initialPosts),[modal,setModal]=useState(false),[exported,setExported]=useState<{url:string;type:"mindmap";name:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const flowRef=useRef<HTMLDivElement>(null),instanceRef=useRef<ReactFlowInstance<IdeaNode,IdeaEdge>|null>(null);
  const changeLabel=useCallback((id:string,label:string)=>setNodes(current=>current.map(node=>node.id===id?{...node,data:{...node.data,label}}:node)),[setNodes]);
  const addChild=useCallback((parentId:string)=>{const instance=instanceRef.current;if(!instance)return;const parent=instance.getNode(parentId);if(!parent)return;const siblings=instance.getEdges().filter(edge=>edge.source===parentId).length,id=crypto.randomUUID(),offset=(siblings%5-2)*115;setNodes(current=>[...current,{id,type:"idea",position:{x:parent.position.x+290,y:parent.position.y+offset},data:{label:"새로운 생각",root:false}}]);setEdges(current=>addEdge({id:`${parentId}-${id}`,source:parentId,target:id,type:"smoothstep",markerEnd:{type:MarkerType.ArrowClosed,color:"#8c7bd1"},style:{stroke:"#8c7bd1",strokeWidth:3}},current));requestAnimationFrame(()=>instance.fitView({padding:.22,duration:350}))},[setEdges,setNodes]);
  const connect=useCallback((connection:Connection)=>setEdges(current=>addEdge({...connection,type:"smoothstep",markerEnd:{type:MarkerType.ArrowClosed,color:"#8c7bd1"},style:{stroke:"#8c7bd1",strokeWidth:3}},current)),[setEdges]);
  const nodeTypes=useMemo(()=>({idea:(props:NodeProps<IdeaNode>)=><IdeaNodeView {...props} onLabelChange={changeLabel} onAddChild={addChild}/ >}),[addChild,changeLabel]);

  async function attachMindmap(){if(!flowRef.current||!instanceRef.current)return;setBusy(true);setError("");try{await instanceRef.current.fitView({padding:.18,duration:250});await new Promise(resolve=>setTimeout(resolve,280));const blob=await toBlob(flowRef.current,{backgroundColor:"#f8f7ff",pixelRatio:2,cacheBust:true,filter:node=>!(node instanceof HTMLElement&&(node.classList.contains("react-flow__controls")||node.classList.contains("react-flow__minimap")||node.classList.contains("react-flow__panel")))});if(!blob)throw new Error("PNG 이미지 변환에 실패했습니다.");const file=new File([blob],`mindmap-${Date.now()}.png`,{type:"image/png"}),result=await uploadBoardFile({file,groupId:group.id,boardId:board.id,userId:profile.id});if("error" in result)throw new Error(result.error??"업로드에 실패했습니다.");setExported({url:result.publicUrl,type:"mindmap",name:file.name});setModal(true)}catch(caught){setError(caught instanceof Error?caught.message:"생각 그물을 저장하지 못했습니다.")}finally{setBusy(false)}}

  return <main className={`mindmap-page background-${board.background}`}><header className="mindmap-head"><div><span><Sparkles/>생각 그물 · React Flow</span><h2>{board.title}</h2><p>+로 가지를 만들거나 연결점을 끌어 생각을 연결하고, 캔버스를 자유롭게 확대해 보세요.</p></div><button onClick={attachMindmap} disabled={busy}><ImagePlus/>{busy?"PNG 만드는 중…":"포스트잇에 생각 그물 첨부하기"}</button></header>{error?<p className="mindmap-error">{error}</p>:null}
    <div ref={flowRef} className="mindmap-flow-canvas"><ReactFlow<IdeaNode,IdeaEdge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} onInit={instance=>{instanceRef.current=instance;requestAnimationFrame(()=>instance.fitView({padding:.25}))}} fitView minZoom={.25} maxZoom={2} snapToGrid snapGrid={[16,16]} deleteKeyCode={["Backspace","Delete"]} proOptions={{hideAttribution:true}}><Background variant={BackgroundVariant.Dots} gap={24} size={1.4} color="#b9b1d3"/><MiniMap pannable zoomable nodeColor={node=>node.data.root?"#b8a8f3":"#f4d976"}/><Controls showInteractive={false}/></ReactFlow></div>
    {posts.length?<section className="mindmap-posts"><h3><Download/>저장한 생각 그물 포스트잇</h3><div>{posts.map(post=><ModernPostCard key={post.id} post={post}/>)}</div></section>:null}<PostModal open={modal} mode="create" boardId={board.id} groupId={group.id} userId={profile.id} initialMedia={exported} canEdit canDelete={false} onClose={()=>setModal(false)} onSaved={post=>setPosts(current=>[post,...current])} onDeleted={()=>{}}/>
  </main>
}
