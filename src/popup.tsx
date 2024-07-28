import { useState } from "react"

import {
  extId,
  MESSAGE_ID,
  TYPE_SWITCHED_OBSERVATION,
  type ObservationSwitchedMessageData
} from "~common"

function IndexPopup() {
  const [observationEnabled, setObservationEnabled] = useState<boolean>(false)

  return (
    <div
      style={{
        padding: 16
      }}>
      <p>WARNING: Please reload the page when you start observation.</p>
      <button
        onClick={() => {
          chrome.runtime.sendMessage({
            type: TYPE_SWITCHED_OBSERVATION,
            id: MESSAGE_ID,
            observationEnabled: !observationEnabled
          } satisfies ObservationSwitchedMessageData)
          setObservationEnabled((v) => !v)
        }}
        style={{
          backgroundColor: observationEnabled ? "blue" : "white",
          color: observationEnabled ? "white" : "blue",
          fontWeight: observationEnabled ? "bold" : "initial"
        }}>
        {observationEnabled
          ? "observation is now ON"
          : "observation is now OFF"}
      </button>
      <br />
      <a
        target="_blank"
        rel="noreferrer"
        href={`chrome-extension://${extId}/tabs/result.html`}>
        open result page
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href={`chrome-extension://${extId}/tabs/configuration.html`}>
        open configuration page
      </a>
    </div>
  )
}

export default IndexPopup
