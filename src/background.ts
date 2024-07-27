import {
  TYPE_DETECTED,
  TYPE_STARTED_OBSERVATION,
  type DetectedMessageData,
  type StartedMessageData
} from "~common"
import { observeApis } from "~override"

export {}

prepareForInjection()
initializeRecorder()

function prepareForInjection() {
  let execute = null
  chrome.runtime.onMessage.addListener((message: StartedMessageData) => {
    if (message.type === TYPE_STARTED_OBSERVATION) {
      if (execute) {
        chrome.webNavigation.onDOMContentLoaded.removeListener(execute)
      }

      execute = createExecuteCallback(message.target)
      chrome.webNavigation.onDOMContentLoaded.addListener(execute)

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url })
      })
    }
  })
}

function createExecuteCallback(targets: string) {
  return (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
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
