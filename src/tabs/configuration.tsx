import { useLayoutEffect, useState } from "react"

import { chromeStorageKeyForConfigurations } from "~common"

function ConfigurationPage() {
  const [configurations, setConfigurations] = useState<string>("")

  useLayoutEffect(() => {
    chrome.storage.local.get(
      chromeStorageKeyForConfigurations,
      ({ configurations }) => {
        setConfigurations(JSON.stringify(configurations, null, 2))
      }
    )

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      const newConfigurations =
        changes[chromeStorageKeyForConfigurations]?.newValue
      if (newConfigurations) {
        setConfigurations(JSON.stringify(newConfigurations, null, 2))
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

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
            { [chromeStorageKeyForConfigurations]: JSON.parse(configurations) },
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
