export const MESSAGE_ID = "whydunit"

export const TYPE_STARTED_OBSERVATION = "started"
export const TYPE_DETECTED = "detected"

export type DetectedMessageData = {
  id: typeof MESSAGE_ID
  type: typeof TYPE_DETECTED
  name: string
  stack: string
  args: string
  boundThis?: string
}

export type StartedMessageData = {
  id: typeof MESSAGE_ID
  type: typeof TYPE_STARTED_OBSERVATION
  target: string
}

export const extId = "fdbpfhlakkfkmajmbkhjiacchkcjhhig"
