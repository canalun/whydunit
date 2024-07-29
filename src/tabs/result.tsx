import { useEffect, useState } from "react"

import {
  chromeStorageKeyForDetections,
  type DetectedMessageData
} from "~common"

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
            <th scope="col">Args</th>
            <th scope="col">BoundThis</th>
            <th scope="col">Stack</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(({ url, name, stack, args, boundThis }, i) => {
            return (
              <tr key={i}>
                <td key={i}>{url}</td>
                <td key={i}>{name}</td>
                <td style={tableCellStyle(500)}>{args}</td>
                <td>{boundThis ?? ""}</td>
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
