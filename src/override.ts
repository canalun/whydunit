import { MESSAGE_ID, TYPE_DETECTED, type DetectedMessageData } from "~common"

export function observeApis(_targetApiNames: string) {
  const originalLog = window.console.log
  const originalError = window.Error
  const originalApply = window.Reflect.apply
  const originalJSONStringify = window.JSON.stringify
  const originalPostMessage = window.postMessage

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
    const { boundThis, error } = getBoundThis(name)
    // Use `=== null`, because `boundThis` is strangely falsy in some cases such as `document.all`.
    if (boundThis === null) {
      console.error(`${name} cannot be observed:`, error)
      return
    }

    const propName = name.split(".").at(-1)
    const originalPrototype = getOriginalPrototype(boundThis, propName)
    // Use `=== null`, because `originalPrototype` is strangely falsy in some cases such as `document.all`.
    if (!originalPrototype) {
      console.error(
        `${name} cannot be observed, because the original prototype is not found.`
      )
      return
    }

    const desc = Object.getOwnPropertyDescriptor(originalPrototype, propName)
    // Property descriptors are of two kinds.
    // https://262.ecma-international.org/15.0/index.html?_gl=1*1n9j7ka*_ga*ODUwMDQyMzQ2LjE3MjIwOTkzOTg.*_ga_TDCK4DWEPP*MTcyMjA5OTM5OC4xLjAuMTcyMjA5OTM5OC4wLjAuMA..#table-object-property-attributes
    if ("value" in desc) {
      // data property case
      Object.defineProperty(originalPrototype, propName, {
        ...desc,
        value: new Proxy(desc.value, createProxyHandler(name))
      })
    } else if ("get" in desc) {
      // accessor property case
      Object.defineProperty(originalPrototype, propName, {
        ...desc,
        get: desc.get
          ? new Proxy(desc.get, createProxyHandler(name))
          : undefined,
        set: desc.set
          ? new Proxy(desc.set, createProxyHandler(name))
          : undefined
      })
    } else {
      console.error(
        `${name} cannot be observed, because the format of property descriptor is not as expected. The descriptor:`,
        desc
      )
    }
  }

  function getBoundThis(name: string) {
    const path = name.split(".")

    let boundThis = globalThis
    let error: Error | null = null
    for (let i = 0; i < path.length - 1; i++) {
      try {
        // Some APIs such as `callee` throw when it's accessed.
        boundThis = boundThis[path[i]]
      } catch (e) {
        boundThis = null
        error = e
        break
      }
    }

    return { boundThis, error }
  }

  function getOriginalPrototype(boundThis: object, propName: string) {
    let originalPrototype = boundThis
    while (
      // `!originalPrototype` doesn't work, because `originalPrototype` is strangely falsy in some cases such as `document.all`.
      originalPrototype instanceof Object &&
      !Object.hasOwn(originalPrototype, propName)
    ) {
      // @ts-expect-error
      originalPrototype = boundThis.__proto__
    }
    if (Object.hasOwn(originalPrototype, propName)) {
      return originalPrototype
    } else {
      return null
    }
  }

  function createProxyHandler(name: string) {
    return {
      apply(target, thisArg, argumentsList) {
        originalLog("Arguments:", Array.from(argumentsList))
        const stack = originalError().stack
        originalLog("Stack:", stack)

        postToDashboard(name, stack, argumentsList)

        return originalApply(target, thisArg, argumentsList)
      }
    }
  }

  function postToDashboard(name: string, stack: string, argsList: unknown[]) {
    let args: string = ""
    try {
      args = originalJSONStringify(argsList)
    } catch {
      args = "*** CANNOT BE STRINGIFIED ***"
    }
    originalPostMessage({
      id: "whydunit" satisfies typeof MESSAGE_ID, // use literal because import statement cannot be used in this file
      type: "detected" satisfies typeof TYPE_DETECTED, // use literal because import statement cannot be used in this file
      name,
      stack,
      args
    } satisfies DetectedMessageData)
  }
}
