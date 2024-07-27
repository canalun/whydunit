import { useEffect, useState } from "react"

import type { DetectedMessageData } from "~common"

function DeltaFlyerPage() {
  const [data, setData] = useState<DetectedMessageData[]>([])
  useEffect(() => {
    chrome.storage.onChanged.addListener(
      ({
        detected: { newValue, oldValue }
      }: {
        detected: {
          newValue: DetectedMessageData[]
          oldValue: DetectedMessageData[]
        }
      }) => {
        setData(newValue)
      }
    )
  }, [])
  return (
    <table>
      <tbody>
        {data.map(({ name, stack, args }, i) => {
          return (
            <tr>
              <td key={i}>
                {name}, {stack.split("\n").slice(2)}, {args}`
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default DeltaFlyerPage
