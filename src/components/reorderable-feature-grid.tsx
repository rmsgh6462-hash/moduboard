"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Cloud, GripVertical, LayoutGrid, Lightbulb, MessageSquareText, Pencil, Save, Vote } from "lucide-react";

const features=[
  {id:"boards",href:"/boards",icon:LayoutGrid,emoji:"📌",title:"모두의 게시판",description:"기둥형·벽돌형·생각 그물로 생각을 자유롭게 붙여요.",tone:"mint"},
  {id:"vote",href:"/vote",icon:Vote,emoji:"🗳️",title:"모두의 투표",description:"찬반 또는 여러 선택지로 우리 반의 생각을 모아요.",tone:"yellow"},
  {id:"word-cloud",href:"/word-cloud",icon:Cloud,emoji:"☁️",title:"모두의 생각구름",description:"친구들의 단어가 하트와 별 모양 생각구름으로 자라요.",tone:"mint"},
  {id:"debate",href:"/debate",icon:MessageSquareText,emoji:"⚔️",title:"모두의 토론",description:"찬성과 반대의 주장과 근거를 단계별로 나눠요.",tone:"rose"},
  {id:"discussion",href:"/discussion",icon:Lightbulb,emoji:"💡",title:"모두의 토의",description:"다양한 아이디어를 모으고 투표로 최종 결정해요.",tone:"lavender"},
] as const;
type FeatureId=(typeof features)[number]["id"];
const defaultOrder=features.map(f=>f.id);

export function ReorderableFeatureGrid({isTeacher}:{isTeacher:boolean}){
  const [order,setOrder]=useState<FeatureId[]>(defaultOrder),[editing,setEditing]=useState(false),[dragged,setDragged]=useState<FeatureId>();
  useEffect(()=>{const saved=window.localStorage.getItem("moduboard:index-feature-order");if(!saved)return;try{const parsed=JSON.parse(saved) as FeatureId[];const valid=parsed.filter(id=>defaultOrder.includes(id));setOrder([...valid,...defaultOrder.filter(id=>!valid.includes(id))])}catch{}},[]);
  function move(id:FeatureId,amount:number){setOrder(current=>{const from=current.indexOf(id),to=Math.max(0,Math.min(current.length-1,from+amount)),next=[...current];next.splice(from,1);next.splice(to,0,id);return next})}
  function drop(target:FeatureId){if(!dragged||dragged===target)return;setOrder(current=>{const next=current.filter(id=>id!==dragged);next.splice(next.indexOf(target),0,dragged);return next});setDragged(undefined)}
  function finish(){window.localStorage.setItem("moduboard:index-feature-order",JSON.stringify(order));setEditing(false)}
  return <><div className="feature-order-bar">{isTeacher?<button className={editing?"active":""} onClick={()=>editing?finish():setEditing(true)}>{editing?<><Save/>순서 저장</>:<><Pencil/>카드 순서 바꾸기</>}</button>:null}{editing?<span>카드를 끌거나 화살표를 눌러 순서를 정하세요.</span>:null}</div><div className={`feature-grid ${editing?"is-ordering":""}`}>{order.map((id,index)=>{const feature=features.find(item=>item.id===id)!;const Icon=feature.icon;return <article key={id} draggable={editing} onDragStart={()=>setDragged(id)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(id)} className={`feature-entry ${feature.tone} bounce-hover ${dragged===id?"dragging":""}`}>{editing?<><div className="feature-drag-handle"><GripVertical/>{index+1}</div><div className="feature-order-buttons"><button disabled={index===0} onClick={()=>move(id,-1)} aria-label={`${feature.title} 앞으로 이동`}><ArrowUp/></button><button disabled={index===order.length-1} onClick={()=>move(id,1)} aria-label={`${feature.title} 뒤로 이동`}><ArrowDown/></button></div></>:null}<Link href={editing?"#":feature.href} onClick={e=>{if(editing)e.preventDefault()}}><div className="feature-icon"><Icon/><span>{feature.emoji}</span></div><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span className="feature-arrow"><ArrowRight/></span></Link></article>})}</div></>
}
