import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16
      }}>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <button
        onClick={() => {
          chrome.runtime.sendMessage({ data })
        }}>
        observe
      </button>
    </div>
  )
}

export default IndexPopup
