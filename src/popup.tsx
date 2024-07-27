import { useState } from "react"

import {
  extId,
  MESSAGE_ID,
  TYPE_STARTED_OBSERVATION,
  type StartedMessageData
} from "~common"

function IndexPopup() {
  const [target, setTarget] = useState("")

  return (
    <div
      style={{
        padding: 16
      }}>
      <input onChange={(e) => setTarget(e.target.value)} value={target} />
      <button
        onClick={() => {
          chrome.runtime.sendMessage({
            target: target,
            type: TYPE_STARTED_OBSERVATION,
            id: MESSAGE_ID
          } satisfies StartedMessageData)
        }}>
        observe
      </button>
      <br />
      <a
        target="_blank"
        rel="noreferrer"
        href={`chrome-extension://${extId}/tabs/detected.html`}>
        open page
      </a>
    </div>
  )
}

export default IndexPopup
