import {
  ALL_URL,
  TYPE_DETECTED,
  TYPE_SWITCHED_OBSERVATION,
  type Configurations,
  type DetectedMessageData,
  type ObservationSwitchedMessageData
} from "~common"
import { observeApis } from "~override"

export {}

prepareForInjection()
initializeRecorder()

function prepareForInjection() {
  let execute = null
  chrome.runtime.onMessage.addListener(
    (message: ObservationSwitchedMessageData) => {
      if (message.type === TYPE_SWITCHED_OBSERVATION) {
        if (execute) {
          chrome.webNavigation.onDOMContentLoaded.removeListener(execute)
        }

        if (message.observationEnabled) {
          chrome.storage.local.get(
            "configurations",
            ({ configurations: _configuration }) => {
              const configurations = JSON.parse(_configuration)
              console.log(configurations)
              execute = createExecuteCallback(configurations)
              chrome.webNavigation.onDOMContentLoaded.addListener(execute)
            }
          )
        }
      }
    }
  )
}

function createExecuteCallback(configs: Configurations) {
  return (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    const pageUrl = details.url
    const targets: string[] = []

    for (const config of configs) {
      console.log(config)
      if (config.url === ALL_URL || pageUrl.includes(config.url)) {
        targets.push(...config.targets)
      }
    }

    chrome.scripting.executeScript({
      target: {
        frameIds: [details.frameId],
        tabId: details.tabId
      },
      world: "MAIN",
      func: observeApis,
      args: [targets]
    })
  }
}

function initializeRecorder() {
  chrome.runtime.onMessage.addListener(async (message: DetectedMessageData) => {
    if (message.type === TYPE_DETECTED) {
      chrome.storage.local.get("detected", (result) => {
        const current = result["detected"]
        if (current?.push) {
          current.push(message)
          chrome.storage.local.set({ detected: current })
        } else {
          chrome.storage.local.set({ detected: [message] })
        }
      })
    }
  })
}
