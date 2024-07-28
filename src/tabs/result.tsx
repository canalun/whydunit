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
        console.log(newValue[0].stack)
      }
    )
  }, [setData])
  return (
    <>
      <button onClick={() => chrome.storage.local.remove("detected")}>
        reset the result
      </button>
      <table>
        <thead>
          <tr>
            <th scope="col">API</th>
            <th scope="col">Stack</th>
            <th scope="col">Args</th>
            <th scope="col">BoundThis</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(({ name, stack, args, boundThis }, i) => {
            return (
              <tr key={i}>
                <td key={i}>{name}</td>
                <td style={tableCellStyle(500)}>
                  {...stack
                    .split("\n")
                    .slice(2)
                    .map((line) => {
                      return (
                        <span>
                          {line}
                          <br />
                        </span>
                      )
                    })}
                </td>
                <td style={tableCellStyle(500)}>{args}</td>
                <td>{boundThis ?? ""}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

const tableCellStyle = (maxWidth: number) => ({
  whiteSpace: "nowrap",
  maxWidth: maxWidth,
  overflow: "hidden",
  textOverflow: "ellipsis"
})

export default ResultPage
