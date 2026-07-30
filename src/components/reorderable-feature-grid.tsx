"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { ArrowDown,ArrowRight,ArrowUp,GripVertical,Home,LayoutGrid,MessageSquareText,Pencil,Save,Sparkles,Vote } from "lucide-react";

const features=[
  {id:"boards",href:"/boards",icon:LayoutGrid,emoji:"📌",title:"모두의 게시판",description:"기둥형·벽돌형·생각 그물로 우리 반의 생각을 자유롭게 붙여요.",tone:"mint",links:[{href:"/boards",label:"게시판 열기"},{href:"/word-cloud",label:"생각구름"}]},
  {id:"vote",href:"/vote",icon:Vote,emoji:"🗳️",title:"모두의 투표",description:"찬반과 여러 선택지로 친구들의 생각을 쉽고 재미있게 모아요.",tone:"yellow",links:[{href:"/vote",label:"투표 참여"},{href:"/word-cloud",label:"생각구름"}]},
  {id:"debate",href:"/debate",icon:MessageSquareText,emoji:"⚔️",title:"모두의 토론 · 토의",description:"주장과 근거를 나누고 다양한 아이디어를 모아 함께 결정해요.",tone:"rose",links:[{href:"/debate",label:"토론"},{href:"/discussion",label:"토의"}]},
  {id:"community",href:"/tong",icon:Sparkles,emoji:"⚡",title:"모두의 통 · 마이룸",description:"매일 친구와 통하고 포인트로 나만의 아기자기한 방을 꾸며요.",tone:"lavender",links:[{href:"/tong",label:"모두의 통"},{href:"/my-room",label:"마이룸",icon:Home}]},
] as const;
type FeatureId=(typeof features)[number]["id"];
const defaultOrder=features.map(feature=>feature.id);

export function ReorderableFeatureGrid({isTeacher}:{isTeacher:boolean}){
  const [order,setOrder]=useState<FeatureId[]>(defaultOrder),[editing,setEditing]=useState(false),[dragged,setDragged]=useState<FeatureId>();
  useEffect(()=>{const saved=window.localStorage.getItem("moduboard:index-feature-order");if(!saved)return;try{const parsed=JSON.parse(saved) as string[],valid=parsed.filter((id):id is FeatureId=>defaultOrder.includes(id as FeatureId));setOrder([...valid,...defaultOrder.filter(id=>!valid.includes(id))])}catch{}},[]);
  function move(id:FeatureId,amount:number){setOrder(current=>{const from=current.indexOf(id),to=Math.max(0,Math.min(current.length-1,from+amount)),next=[...current];next.splice(from,1);next.splice(to,0,id);return next})}
  function drop(target:FeatureId){if(!dragged||dragged===target)return;setOrder(current=>{const next=current.filter(id=>id!==dragged);next.splice(next.indexOf(target),0,dragged);return next});setDragged(undefined)}
  function finish(){window.localStorage.setItem("moduboard:index-feature-order",JSON.stringify(order));setEditing(false)}
  return <><div className="feature-order-bar">{isTeacher?<button className={editing?"active":""} onClick={()=>editing?finish():setEditing(true)}>{editing?<><Save/>순서 저장</>:<><Pencil/>카드 순서 바꾸기</>}</button>:null}{editing?<span>카드를 끌거나 화살표를 눌러 순서를 정하세요.</span>:null}</div><div className={`feature-grid dashboard-feature-grid ${editing?"is-ordering":""}`}>{order.map((id,index)=>{const feature=features.find(item=>item.id===id)!;const Icon=feature.icon;return <article key={id} draggable={editing} onDragStart={()=>setDragged(id)} onDragOver={event=>event.preventDefault()} onDrop={()=>drop(id)} className={`feature-entry dashboard-feature-card ${feature.tone} bounce-hover ${dragged===id?"dragging":""}`}>{editing?<><div className="feature-drag-handle"><GripVertical/>{index+1}</div><div className="feature-order-buttons"><button disabled={index===0} onClick={()=>move(id,-1)} aria-label={`${feature.title} 앞으로 이동`}><ArrowUp/></button><button disabled={index===order.length-1} onClick={()=>move(id,1)} aria-label={`${feature.title} 뒤로 이동`}><ArrowDown/></button></div></>:null}<Link className="feature-main-link" href={editing?"#":feature.href} onClick={event=>{if(editing)event.preventDefault()}}><div className="feature-icon"><Icon/><span>{feature.emoji}</span></div><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span className="feature-arrow"><ArrowRight/></span></Link><div className="feature-sub-links">{feature.links.map(link=><Link key={link.href+link.label} href={editing?"#":link.href} onClick={event=>{if(editing)event.preventDefault()}}>{link.label}<ArrowRight/></Link>)}</div></article>})}</div></>
}
