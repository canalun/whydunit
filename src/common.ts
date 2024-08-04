export const MESSAGE_ID = "whydunit"

export const TYPE_SWITCHED_OBSERVATION = "switched"
export const TYPE_DETECTED = "detected"

export type DetectedMessageData = {
  id: typeof MESSAGE_ID
  type: typeof TYPE_DETECTED
  url: string
  name: string
  stack: string
  args: string[]
  boundThis?: string
  firedEventType: string | null
}

export type ObservationSwitchedMessageData = {
  id: typeof MESSAGE_ID
  type: typeof TYPE_SWITCHED_OBSERVATION
  observationEnabled: boolean
}

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
    url: "https://ja.wikipedia.org",
    targets: [
      {
        apiName: "String.prototype.replace",
        debugInfo: {
          boundThis: "test"
        }
      }
    ]
  }
]

export type Target = {
  apiName: string
  debugInfo?: DebugInfo
}
type DebugInfo =
  | {
      args: string[]
      boundThis: unknown
    }
  | {
      boundThis: unknown
    }
  | {
      args: string[]
    }

export const chromeStorageKeyForConfigurations = "configurations"
export const chromeStorageKeyForDetections = "detections"
