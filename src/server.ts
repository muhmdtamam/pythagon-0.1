import express from "express"
import cors from "cors"
import fs from "fs"
import {v4 as uuid} from "uuid"
import config from "./config"

const app = express()
app.use(cors())
app.use(express.json())

const read = (p:string)=>JSON.parse(fs.readFileSync(p,"utf-8"))
const write = (p:string,d:any)=>fs.writeFileSync(p,JSON.stringify(d,null,2))

app.post("/api/session", (req,res)=>{
  const sessions = read(config.SESSION_PATH)
  const id = uuid()
  sessions[id] = {created:Date.now()}
  write(config.SESSION_PATH,sessions)
  res.json({sessionId:id})
})

app.get("/api/personality", (req,res)=>{
  res.json(read(config.PERSONALITY_PATH))
})

app.post("/api/personality", (req,res)=>{
  write(config.PERSONALITY_PATH,req.body)
  res.json({ok:1})
})

app.post("/api/chat", async (req,res)=>{
  const {q,sessionId} = req.body
  const personality = read(config.PERSONALITY_PATH)
  const db = read(config.DB_PATH)

  const aiRes = await fetch(config.BASE_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":config.API_KEY},
    body:JSON.stringify({q,prompt:personality.prompt})
  })
  const data = await aiRes.json()

  if(!db[sessionId]) db[sessionId]=[]
  db[sessionId].push({r:"user",t:q})
  db[sessionId].push({r:"bot",t:data.reply||data.message})
  write(config.DB_PATH,db)

  res.json(data)
})

app.get("/api/history/:sessionId", (req,res)=>{
  const db = read(config.DB_PATH)
  res.json(db[req.params.sessionId]||[])
})

app.listen(3000,()=>console.log("ok"))