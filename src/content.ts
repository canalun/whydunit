import type { DetectedMessageData } from "~common"
import { MESSAGE_ID, TYPE_DETECTED } from "~common"

export {}

window.addEventListener("message", (message: { data: DetectedMessageData }) => {
  const { data } = message
  if (data.id === MESSAGE_ID && data.type === TYPE_DETECTED) {
    chrome.runtime.sendMessage(data)
  }
})
