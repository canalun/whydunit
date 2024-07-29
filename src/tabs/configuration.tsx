import { useState } from "react"

import {
  chromeStorageKeyForConfigurations,
  defaultConfigurations
} from "~common"

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
          chrome.storage.local.set(
            { [chromeStorageKeyForConfigurations]: configurations },
            () => {
              setIsSaved(true)
              setIsWarningDisplayed(true)
            }
          )
        }}>
        save
      </button>
      {isWarningDisplayed ? <p>Saved. Please restart observation.</p> : null}
    </>
  )
}

export default ConfigurationPage
