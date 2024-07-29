import {
  ALL_URL,
  chromeStorageKeyForConfigurations,
  chromeStorageKeyForDetections,
  defaultConfigurations,
  TYPE_DETECTED,
  TYPE_SWITCHED_OBSERVATION,
  type Configurations,
  type DetectedMessageData,
  type ObservationSwitchedMessageData,
  type Target
} from "~common"
import { observeApis } from "~override"

export {}

installDefaultConfigurations()
prepareForInjection()
initializeRecorder()

function installDefaultConfigurations() {
  chrome.storage.local.set({
    [chromeStorageKeyForConfigurations]: defaultConfigurations
  })
}

function prepareForInjection() {
  let execute:
    | ((
        details: chrome.webNavigation.WebNavigationFramedCallbackDetails
      ) => void)
    | null = null
  chrome.runtime.onMessage.addListener(
    (message: ObservationSwitchedMessageData) => {
      if (message.type === TYPE_SWITCHED_OBSERVATION) {
        if (execute) {
          chrome.webNavigation.onDOMContentLoaded.removeListener(execute)
        }

        if (message.observationEnabled) {
          chrome.storage.local.get(
            chromeStorageKeyForConfigurations,
            ({ [chromeStorageKeyForConfigurations]: configurations }) => {
              execute = createExecuteCallback(configurations)
              console.log("observation is ready, now waiting for reload...")
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
    const targets: Target[] = []

    for (const config of configs) {
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
      chrome.storage.local.get(chromeStorageKeyForDetections, (result) => {
        const current = result[chromeStorageKeyForDetections]
        if (current?.push) {
          current.push(message)
          chrome.storage.local.set({ [chromeStorageKeyForDetections]: current })
        } else {
          chrome.storage.local.set({
            [chromeStorageKeyForDetections]: [message]
          })
        }
      })
    }
  })
}
