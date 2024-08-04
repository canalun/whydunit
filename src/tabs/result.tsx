import { useEffect, useState, type CSSProperties } from "react"

import {
  chromeStorageKeyForDetections,
  type DetectedMessageData
} from "~common"

// TODO: CSV
// TODO: Sentry Integration
function ResultPage() {
  const [data, setData] = useState<DetectedMessageData[]>([])
  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      const detections = changes[chromeStorageKeyForDetections]?.newValue
      if (detections) {
        setData(detections)
      }
    })
  }, [setData])
  return (
    <>
      <button
        onClick={() =>
          chrome.storage.local.remove(chromeStorageKeyForDetections)
        }>
        reset the result
      </button>
      <table>
        <thead>
          <tr>
            <th scope="col">url</th>
            <th scope="col">API</th>
            <th scope="col">Event</th>
            <th scope="col">Args</th>
            <th scope="col">BoundThis</th>
            <th scope="col">Stack</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(
            ({ url, name, stack, args, boundThis, firedEventType }, i) => {
              return (
                <tr key={i}>
                  <td style={tableCellStyle(300)} key={i}>
                    {url}
                  </td>
                  <td key={i}>{name}</td>
                  <td key={i}>{firedEventType || ""}</td>
                  <td style={tableCellStyle(300)} key={i}>
                    {args}
                  </td>
                  <td key={i}>{boundThis ?? ""}</td>
                  <td style={tableCellStyle(300)} key={i}>
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
                </tr>
              )
            }
          )}
        </tbody>
      </table>
    </>
  )
}

const tableCellStyle: (maxWidth: number) => CSSProperties = (
  maxWidth: number
) => ({
  whiteSpace: "nowrap",
  maxWidth: maxWidth,
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordWrap: "break-word"
})

export default ResultPage
