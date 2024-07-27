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

    const propKey = name.split(".").at(-1)
    const originalPrototype = getOriginalPrototype(boundThis, propKey)
    // Use `=== null`, because `originalPrototype` is strangely falsy in some cases such as `document.all`.
    if (!originalPrototype) {
      console.error(
        `${name} cannot be observed, because the original prototype is not found.`
      )
      return
    }

    // TODO: is this right?
    const isBoundThisLogEnabled = name.split(".").at(-2) === "prototype"
    override(originalPrototype, propKey, name, isBoundThisLogEnabled)

    return
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

  function getOriginalPrototype(boundThis: object, propKey: string) {
    let originalPrototype = boundThis
    while (
      // `!originalPrototype` doesn't work, because `originalPrototype` is strangely falsy in some cases such as `document.all`.
      originalPrototype instanceof Object &&
      !Object.hasOwn(originalPrototype, propKey)
    ) {
      // @ts-expect-error
      originalPrototype = boundThis.__proto__
    }
    if (Object.hasOwn(originalPrototype, propKey)) {
      return originalPrototype
    } else {
      return null
    }
  }

  function override(
    originalPrototype: object,
    propKey: string,
    name: string,
    isBoundThisLogEnabled: boolean
  ) {
    const desc = Object.getOwnPropertyDescriptor(originalPrototype, propKey)
    // Property descriptors are of two kinds.
    // https://262.ecma-international.org/15.0/index.html?_gl=1*1n9j7ka*_ga*ODUwMDQyMzQ2LjE3MjIwOTkzOTg.*_ga_TDCK4DWEPP*MTcyMjA5OTM5OC4xLjAuMTcyMjA5OTM5OC4wLjAuMA..#table-object-property-attributes
    if ("value" in desc) {
      // data property case
      Object.defineProperty(originalPrototype, propKey, {
        ...desc,
        value: new Proxy(
          desc.value,
          createProxyHandler(name, isBoundThisLogEnabled)
        )
      })
    } else if ("get" in desc) {
      // accessor property case
      Object.defineProperty(originalPrototype, propKey, {
        ...desc,
        get: desc.get
          ? new Proxy(desc.get, createProxyHandler(name, isBoundThisLogEnabled))
          : undefined,
        set: desc.set
          ? new Proxy(desc.set, createProxyHandler(name, isBoundThisLogEnabled))
          : undefined
      })
    } else {
      console.error(
        `${name} cannot be observed, because the format of property descriptor is not as expected. The descriptor:`,
        desc
      )
    }
  }

  function createProxyHandler(name: string, isBoundThisLogEnabled: boolean) {
    return {
      apply(target, thisArg, argumentsList) {
        originalLog("Arguments:", Array.from(argumentsList))

        const stack = originalError().stack
        originalLog("Stack:", stack)

        isBoundThisLogEnabled && originalLog("BoundThis:", thisArg)

        postToDashboard(
          name,
          stack,
          argumentsList,
          isBoundThisLogEnabled ? thisArg : undefined
        )

        return originalApply(target, thisArg, argumentsList)
      }
    }
  }

  function postToDashboard(
    name: string,
    stack: string,
    argsList: unknown[],
    _boundThis?: unknown
  ) {
    let args: string = ""
    try {
      args = originalJSONStringify(argsList)
    } catch {
      args = "*** CANNOT BE STRINGIFIED ***"
    }

    let boundThis: undefined | string = undefined
    try {
      boundThis = !!_boundThis ? originalJSONStringify(_boundThis) : undefined
    } catch {
      boundThis = "*** CANNOT BE STRINGIFIED ***"
    }

    originalPostMessage({
      id: "whydunit" satisfies typeof MESSAGE_ID, // use literal because import statement cannot be used in this file
      type: "detected" satisfies typeof TYPE_DETECTED, // use literal because import statement cannot be used in this file
      name,
      stack,
      args,
      boundThis
    } satisfies DetectedMessageData)
  }
}
