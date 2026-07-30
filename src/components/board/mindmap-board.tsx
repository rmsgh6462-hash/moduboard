"use client";

import { useRef, useState } from "react";
import { Download, ImagePlus, Plus, Sparkles } from "lucide-react";
import { PostModal } from "@/components/board/post-modal";
import { ModernPostCard } from "@/components/board/modern-post-card";
import { uploadBoardFile } from "@/lib/storage/upload-board-file";
import type { Board, Group, Post, UserProfile } from "@/types/database";

type Node = { id: string; parentId: string | null; text: string; x: number; y: number };
type Drag = { id: string; dx: number; dy: number } | null;
const WIDTH = 1200, HEIGHT = 720, NODE_W = 190, NODE_H = 104;

export function MindmapBoard({ board, group, profile, initialPosts }: { board: Board; group: Group; profile: UserProfile; initialPosts: Post[] }) {
  const [nodes, setNodes] = useState<Node[]>([{ id: "root", parentId: null, text: board.title || "우리의 주제", x: 505, y: 290 }]);
  const [posts, setPosts] = useState(initialPosts);
  const [drag, setDrag] = useState<Drag>(null);
  const [modal, setModal] = useState(false);
  const [exported, setExported] = useState<{ url: string; type: "mindmap"; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  function addChild(parent: Node) {
    const siblings = nodes.filter(n => n.parentId === parent.id).length;
    const angle = siblings * 0.9 - 0.8;
    const id = crypto.randomUUID();
    setNodes(v => [...v, { id, parentId: parent.id, text: "새로운 생각", x: Math.max(10, Math.min(WIDTH-NODE_W-10, parent.x + Math.cos(angle)*300)), y: Math.max(10, Math.min(HEIGHT-NODE_H-10, parent.y + Math.sin(angle)*210)) }]);
  }

  function pointerMove(e: React.PointerEvent) {
    if (!drag || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = WIDTH / rect.width, sy = HEIGHT / rect.height;
    setNodes(v => v.map(n => n.id === drag.id ? { ...n, x: Math.max(0, Math.min(WIDTH-NODE_W, (e.clientX-rect.left)*sx-drag.dx)), y: Math.max(0, Math.min(HEIGHT-NODE_H, (e.clientY-rect.top)*sy-drag.dy)) } : n));
  }

  function exportSvg() {
    const lines = nodes.filter(n=>n.parentId).map(n=>{const p=nodes.find(x=>x.id===n.parentId)!;return `<path d="M ${p.x+NODE_W/2} ${p.y+NODE_H/2} C ${p.x+NODE_W/2+80} ${p.y+NODE_H/2}, ${n.x+NODE_W/2-80} ${n.y+NODE_H/2}, ${n.x+NODE_W/2} ${n.y+NODE_H/2}" fill="none" stroke="#8b7dcc" stroke-width="5" stroke-linecap="round"/>`}).join("");
    const cards = nodes.map((n,i)=>`<g><rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${NODE_H}" rx="20" fill="${i===0?'#ddd6fe':'#fff4bd'}" stroke="#ffffff" stroke-width="3"/><foreignObject x="${n.x+12}" y="${n.y+12}" width="${NODE_W-24}" height="${NODE_H-24}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px sans-serif;color:#29263a;text-align:center;display:flex;align-items:center;justify-content:center;width:100%;height:100%;word-break:break-word">${n.text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]!))}</div></foreignObject></g>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8f7ff"/><stop offset="1" stop-color="#e8f7f2"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/>${lines}${cards}</svg>`;
  }

  async function attachMindmap() {
    setBusy(true); setError("");
    try {
      const svg = exportSvg();
      const img = new Image();
      const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error("이미지 변환 실패"));img.src=blobUrl;});
      const canvas = document.createElement("canvas"); canvas.width=WIDTH; canvas.height=HEIGHT;
      canvas.getContext("2d")!.drawImage(img,0,0); URL.revokeObjectURL(blobUrl);
      const png = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG 변환 실패")),"image/png"));
      const file = new File([png], `mindmap-${Date.now()}.png`, { type: "image/png" });
      const result = await uploadBoardFile({ file, groupId: group.id, boardId: board.id, userId: profile.id });
      if ("error" in result) throw new Error(result.error);
      setExported({ url: result.publicUrl, type: "mindmap", name: file.name }); setModal(true);
    } catch (e) { setError(e instanceof Error ? e.message : "생각 그물을 저장하지 못했습니다."); }
    finally { setBusy(false); }
  }

  return <main className={`mindmap-page background-${board.background}`}>
    <header className="mindmap-head"><div><span><Sparkles /> 생각 그물</span><h2>{board.title}</h2><p>+로 가지를 만들고 포스트잇을 끌어 생각을 자유롭게 연결해 보세요.</p></div><button onClick={attachMindmap} disabled={busy}><ImagePlus />{busy ? "PNG 만드는 중…" : "포스트잇에 생각 그물 첨부하기"}</button></header>
    {error ? <p className="mindmap-error">{error}</p> : null}
    <div className="mindmap-scroll"><div ref={canvasRef} className="mindmap-canvas" onPointerMove={pointerMove} onPointerUp={()=>setDrag(null)} onPointerLeave={()=>setDrag(null)}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden>{nodes.filter(n=>n.parentId).map(n=>{const p=nodes.find(x=>x.id===n.parentId)!;return <path key={n.id} d={`M ${p.x+NODE_W/2} ${p.y+NODE_H/2} C ${p.x+NODE_W/2+80} ${p.y+NODE_H/2}, ${n.x+NODE_W/2-80} ${n.y+NODE_H/2}, ${n.x+NODE_W/2} ${n.y+NODE_H/2}`} />})}</svg>
      {nodes.map((n,i)=><article key={n.id} className={`mindmap-node ${i===0?'root':''}`} style={{left:`${n.x/WIDTH*100}%`,top:`${n.y/HEIGHT*100}%`,width:`${NODE_W/WIDTH*100}%`,height:`${NODE_H/HEIGHT*100}%`}} onPointerDown={e=>{if((e.target as HTMLElement).closest('button,input'))return;const rect=e.currentTarget.getBoundingClientRect();setDrag({id:n.id,dx:(e.clientX-rect.left)*WIDTH/canvasRef.current!.getBoundingClientRect().width,dy:(e.clientY-rect.top)*HEIGHT/canvasRef.current!.getBoundingClientRect().height});e.currentTarget.setPointerCapture(e.pointerId)}}><input value={n.text} aria-label={i===0?'중앙 주제':'아이디어'} onChange={e=>setNodes(v=>v.map(x=>x.id===n.id?{...x,text:e.target.value}:x))}/><button onClick={()=>addChild(n)} aria-label="하위 생각 추가"><Plus /></button></article>)}
    </div></div>
    {posts.length ? <section className="mindmap-posts"><h3><Download /> 저장한 생각 그물 포스트잇</h3><div>{posts.map(p=><ModernPostCard key={p.id} post={p} />)}</div></section> : null}
    <PostModal open={modal} mode="create" boardId={board.id} groupId={group.id} userId={profile.id} initialMedia={exported} canEdit canDelete={false} onClose={()=>setModal(false)} onSaved={p=>setPosts(v=>[p,...v])} onDeleted={()=>{}} />
  </main>;
}
