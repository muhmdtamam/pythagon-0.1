import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

const style = document.createElement("style")
style.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById("root")!).render(<App/>)
