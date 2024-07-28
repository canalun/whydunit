import { useState } from "react"

import { chromiumApis } from "~chromiumApis"
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
        padding: 16,
        minWidth: 480,
        minHeight: 480
      }}>
      <input
        list="apis"
        onChange={(e) => setTarget(e.target.value)}
        value={target}
      />
      <datalist id="apis">
        {chromiumApis.map((api) => (
          <option value={api} />
        ))}
        {/* --- edge cases --- */}
        <option value="document.all" />
        <option value="document.all.length" />
        {/* --- edge cases --- */}
      </datalist>
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
        href={`chrome-extension://${extId}/tabs/result.html`}>
        open page
      </a>
    </div>
  )
}

export default IndexPopup
