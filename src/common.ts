export const MESSAGE_ID = "whydunit"

export const TYPE_SWITCHED_OBSERVATION = "switched"
export const TYPE_DETECTED = "detected"

export type DetectedMessageData = {
  url: string
  id: typeof MESSAGE_ID
  type: typeof TYPE_DETECTED
  name: string
  stack: string
  args: string
  boundThis?: string
}

export type ObservationSwitchedMessageData = {
  id: typeof MESSAGE_ID
  type: typeof TYPE_SWITCHED_OBSERVATION
  observationEnabled: boolean
}

export const EXT_ID = "fdbpfhlakkfkmajmbkhjiacchkcjhhig"

export type Configurations = {
  url: string
  targets: string[]
}[]

export const ALL_URL = "<all_url>"
