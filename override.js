const targetApiNames = [
  "globalThis.fetch",
  "globalThis.console.log",
  "globalThis.document.write"
]

/////////////////////////////////////////////////////////////

console.log("start observing...")

var originalLog = window.console.log
var originalError = window.Error
var originalFetch = window.fetch
var originalApply = window.Reflect.apply
var originalJSONStringify = window.JSON.stringify

observeAllApis()

function observeAllApis() {
  for (const name of targetApiNames) {
    observeApi(name)
  }
}

function observeApi(name) {
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
    body: {
      name: name,
      stack: stack,
      args: args
    },
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
}
