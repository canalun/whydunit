import { useState } from "react"

import { ALL_URL, type Configurations } from "~common"

function ConfigurationPage() {
  const [configurations, setConfigurations] = useState<string>(
    JSON.stringify(defaultConfigurations, null, 2)
  )
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [isWarningDisplayed, setIsWarningDisplayed] = useState<boolean>(false)

  return (
    <>
      <div>
        <textarea
          style={{ width: 300, height: 200 }}
          onChange={(e) => {
            setIsSaved(false)
            setIsWarningDisplayed(false)
            setConfigurations(e.target.value)
          }}
          value={configurations}
          spellCheck={true}
        />
      </div>
      <button
        disabled={isSaved}
        onClick={() => {
          chrome.storage.local.set({ configurations }, () => {
            setIsSaved(true)
            setIsWarningDisplayed(true)
          })
        }}>
        save
      </button>
      {isWarningDisplayed ? <p>Saved. Please restart observation.</p> : null}
    </>
  )
}

export default ConfigurationPage

const defaultConfigurations: Configurations = [
  {
    url: ALL_URL,
    targets: [
      "Element.prototype.children",
      "console.log",
      "fetch",
      "document.all.length"
    ]
  },
  {
    url: "https://en.wikipedia.org",
    targets: ["String.prototype.split"]
  }
]
