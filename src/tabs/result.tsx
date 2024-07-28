import { useEffect, useState } from "react"

import type { DetectedMessageData } from "~common"

function ResultPage() {
  const [data, setData] = useState<DetectedMessageData[]>([])
  useEffect(() => {
    chrome.storage.onChanged.addListener(
      ({
        detected: { newValue }
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
        {data.map(({ name, stack, args, boundThis }, i) => {
          return (
            <tr>
              <td key={i}>
                {name}, {stack.split("\n").slice(2)}, {args}, {boundThis ?? ""}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ResultPage
