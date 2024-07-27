import { observeApis } from "~override"

export {}

prepareForInjection()

function prepareForInjection() {
  let execute = null
  chrome.runtime.onMessage.addListener((message: { data: string }) => {
    if (message.data) {
      if (execute) {
        chrome.webNavigation.onDOMContentLoaded.removeListener(execute)
      }

      execute = createExecuteCallback(message.data)
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
