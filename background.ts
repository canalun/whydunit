export {}

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  chrome.scripting.executeScript({
    target: {
      frameIds: [details.frameId],
      tabId: details.tabId
    },
    world: "MAIN",
    // files: ["override.js"]
    func: () => {
      /////////////////////////
      /////////////////////////
      /////////////////////////
      overrideDocumentWrite()

      function overrideDocumentWrite() {
        var originalWrite = document.write

        document.write = function () {
          // オリジナルの関数を呼び出す
          var result = originalWrite.apply(this, arguments)

          // スタックトレースを取得
          var stack = new Error().stack

          // スタックトレースを解析
          var stackLines = stack.split("\n").slice(1) // 最初の行（Error オブジェクト自体）を除外
          var callerInfo = parseStackTrace(stackLines)

          // 呼び出し情報をログに記録
          console.warn("document.write was called")
          console.log("Arguments:", Array.from(arguments))
          console.log("Caller:", callerInfo)
          console.log("Full stack:", stack)

          // CORSがあってもPOSTはできるはず
          fetch("https://httpbin.org/post", {
            method: "POST",
            body: JSON.stringify({
              title: "Hello World",
              body: "My POST request"
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          })
            .then((response) => response.json())
            .then((json) => console.log(json))

          return result
        }

        function parseStackTrace(stackLines: string[]) {
          // document.write の呼び出し元を探す（最初のdocument.writeではない行）
          for (var i = 0; i < stackLines.length; i++) {
            if (stackLines[i].indexOf("at Document.write") === -1) {
              return stackLines[i].trim()
            }
          }
          return "Unknown caller"
        }
      }

      /////////////////////
      /////////////////////
      /////////////////////
    }
  })
})
