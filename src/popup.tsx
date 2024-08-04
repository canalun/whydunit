import { useLayoutEffect, useState } from "react"

function IndexPopup() {
  const [isObservationEnabled, setIsObservationEnabled] =
    useState<boolean>(false)
  useLayoutEffect(() => {
    chrome.storage.local.get(
      "isObservationEnabled",
      ({ isObservationEnabled }) =>
        setIsObservationEnabled(!!isObservationEnabled)
    )
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      setIsObservationEnabled(!!changes.isObservationEnabled.newValue)
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  return (
    <div
      style={{
        padding: 16
      }}>
      <p>WARNING: Please reload the page when you start observation.</p>
      <button
        onClick={() => {
          chrome.storage.local.get(
            "isObservationEnabled",
            ({ isObservationEnabled }) => {
              chrome.storage.local.set({
                isObservationEnabled: !isObservationEnabled
              })
            }
          )
        }}
        style={{
          backgroundColor: isObservationEnabled ? "blue" : "white",
          color: isObservationEnabled ? "white" : "blue",
          fontWeight: isObservationEnabled ? "bold" : "initial"
        }}>
        {isObservationEnabled
          ? "observation is now ON"
          : "observation is now OFF"}
      </button>
      <br />
      <a
        target="_blank"
        rel="noreferrer"
        href={`chrome-extension://${chrome.runtime.id}/tabs/result.html`}>
        open result page
      </a>
      <br />
      <a
        target="_blank"
        rel="noreferrer"
        href={`chrome-extension://${chrome.runtime.id}/tabs/configuration.html`}>
        open configuration page
      </a>
    </div>
  )
}

export default IndexPopup
