import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

const style = document.createElement("style")
style.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes blink { 50% { opacity: 0; } }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0a0e0a; }
  ::-webkit-scrollbar-thumb { background: #1a3d1a; border-radius: 4px; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById("root")!).render(<App/>)
