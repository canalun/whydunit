export const MESSAGE_ID = "whydunit"

export const TYPE_SWITCHED_OBSERVATION = "switched"
export const TYPE_DETECTED = "detected"

export type DetectedMessageData = {
  url: string
  id: typeof MESSAGE_ID
  type: typeof TYPE_DETECTED
  name: string
  stack: string
  args: string[]
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
  targets: Target[]
}[]

export const ALL_URL = "<all_url>"

export const defaultConfigurations: Configurations = [
  {
    url: ALL_URL,
    targets: [
      { apiName: "Element.prototype.children" },
      {
        apiName: "console.log",
        debugInfo: {
          args: ["test"]
        }
      },
      { apiName: "fetch" },
      { apiName: "document.all.length" }
    ]
  },
  {
    url: "https://en.wikipedia.org",
    targets: [{ apiName: "String.prototype.split" }]
  }
]

export type Target = {
  apiName: string
  debugInfo?: DebugInfo
}
type DebugInfo =
  | {
      args: string[]
      bindThis: unknown
    }
  | {
      bindThis: unknown
    }
  | {
      args: string[]
    }

export const chromeStorageKeyForConfigurations = "configurations"
export const chromeStorageKeyForDetections = "detections"
