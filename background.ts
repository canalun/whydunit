export {}

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  chrome.scripting.executeScript({
    target: {
      frameIds: [details.frameId],
      tabId: details.tabId
    },
    world: "MAIN",
    files: ["override.js"]
  })
})
