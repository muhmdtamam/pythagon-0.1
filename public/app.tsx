import {useState,useRef,useEffect} from "react"

export default function App(){
const [m,setM]=useState([{r:"bot",t:"Halo"}])
const [i,setI]=useState("")
const [l,setL]=useState(false)
const [sid,setSid]=useState("")
const ref=useRef<HTMLDivElement>(null)
useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[m])
useEffect(()=>{fetch("/api/session",{method:"POST"}).then(r=>r.json()).then(d=>setSid(d.sessionId))},[])

const send=async()=>{
if(!i||!sid)return
setM([...m,{r:"user",t:i}])
const q=i;setI("");setL(true)
const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q,sessionId:sid})})
const d=await res.json()
setM(p=>[...p,{r:"bot",t:d.reply||d.message||"err"}])
setL(false)
}

return(
<div style={{width:"100%",maxWidth:700,height:"100vh",margin:"0 auto",display:"flex",flexDirection:"column",background:"#fff",fontFamily:"Arial"}}>
<div style={{padding:16,background:"#4f46e5",color:"white",textAlign:"center"}}><h2>AI</h2></div>
<div style={{flex:1,padding:16,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,background:"#f3f4f6"}}>
{m.map((x,k)=><div key={k} style={{padding:12,borderRadius:18,maxWidth:"80%",background:x.r==="user"?"#4f46e5":"#e5e7eb",color:x.r==="user"?"white":"#000",alignSelf:x.r==="user"?"flex-end":"flex-start"}}>{x.t}</div>)}
{l&&<div style={{padding:12,borderRadius:18,background:"#e5e7eb",alignSelf:"flex-start"}}>...</div>}
<div ref={ref}/>
</div>
<div style={{display:"flex",padding:12,gap:8}}>
<input value={i} onChange={e=>setI(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ketik..." style={{flex:1,padding:12,borderRadius:20,border:"1px solid #ccc",outline:"none"}}/>
<button onClick={send} style={{padding:"12px 20px",borderRadius:20,border:"none",background:"#4f46e5",color:"white"}}>Kirim</button>
</div>
</div>
)
}