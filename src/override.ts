export function observeApis(_targetApiNames: string) {
  const originalLog = window.console.log
  const originalError = window.Error
  const originalFetch: typeof globalThis.fetch = window.fetch
  const originalApply = window.Reflect.apply
  const originalJSONStringify = window.JSON.stringify

  /////////////////////////////////////////////////////////////

  observeAllApis()

  function observeAllApis() {
    const targetApiNames = _targetApiNames.split(",").map((name) => name.trim())
    console.log(`start observing...\n${targetApiNames.join("\n")}`)
    for (const name of targetApiNames) {
      observeApi(name)
    }
  }

  function observeApi(name: string) {
    const original = getRef(name)
    if (!original) {
      console.log(`${name} cannot be observed.`)
      return
    }

    const handler = {
      apply(target, thisArg, argumentsList) {
        originalLog("Arguments:", Array.from(argumentsList))
        const stack = originalError().stack
        originalLog("Stack:", stack)

        postToDashboard(name, stack, argumentsList)

        return originalApply(target, thisArg, argumentsList)
      }
    }

    const tmp = name.split(".")
    const obj = getRef(tmp.slice(0, tmp.length - 1).join("."))
    obj[tmp[tmp.length - 1]] = new Proxy(original, handler)
  }

  function getRef(name) {
    let target = null

    const path = name.split(".")
    for (let i = 0; i < path.length; i++) {
      try {
        // Some APIs such as `callee` throw when it's accessed.
        target = i === 0 ? window[path[i]] : target[path[i]]
      } catch {
        target = null
        break
      }
    }

    return target
  }

  function postToDashboard(name, stack, argsList) {
    let args = ""
    try {
      args = originalJSONStringify(argsList)
    } catch {
      args = "*** CANNOT BE STRINGIFIED ***"
    }
    // CORSがあってもPOSTはできるはず
    originalFetch("https://httpbin.org/post", {
      method: "POST",
      body: originalJSONStringify({
        name: name,
        stack: stack,
        args: args
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
  }
}
