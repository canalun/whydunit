import {
  MESSAGE_ID,
  TYPE_DETECTED,
  type DetectedMessageData,
  type Target
} from "~common"

export function observeApis(targets: Target[]) {
  const originalLog = window.console.log
  const originalError = window.Error
  const originalApply = window.Reflect.apply
  const originalJSONStringify = window.JSON.stringify
  const originalPostMessage = window.postMessage

  const originalLocationHref = Object.getOwnPropertyDescriptor(
    window.location,
    "href"
  )!.get!.bind(window.location)

  /////////////////////////////////////////////////////////////

  observeAllApis()

  function observeAllApis() {
    console.log(
      `start observing...\n${targets.map((t) => t.apiName).join("\n")}`
    )
    for (const name of targets) {
      observeApi(name)
    }
  }

  function observeApi(target: Target) {
    const name = target.apiName
    const { boundThis, error } = getBoundThis(name)
    // Use `=== null`, because `boundThis` is strangely falsy in some cases such as `document.all`.
    if (boundThis === null) {
      console.error(`${name} cannot be observed:`, error)
      return
    }

    const propKey = name.split(".").at(-1)!
    const originalPrototype = getOriginalPrototype(boundThis, propKey)
    // Use `=== null`, because `originalPrototype` is strangely falsy in some cases such as `document.all`.
    if (!originalPrototype) {
      console.error(
        `${name} cannot be observed, because the original prototype is not found.`
      )
      return
    }

    const isBoundThisLogEnabled = name.split(".").at(-2) === "prototype" // TODO: is this right?
    const handler = createProxyHandler(target, isBoundThisLogEnabled)
    override(originalPrototype, propKey, handler)

    return
  }

  function getBoundThis(name: string) {
    const path = name.split(".")

    let boundThis = globalThis
    let error: Error | null = null
    for (let i = 0; i < path.length - 1; i++) {
      // try is necessary, because some APIs such as `callee` throw when it's accessed.
      try {
        // @ts-expect-error
        boundThis = boundThis[path[i]]
      } catch (e) {
        // @ts-expect-error
        boundThis = null
        // @ts-expect-error
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
      originalPrototype = originalPrototype.__proto__
    }
    if (Object.hasOwn(originalPrototype, propKey)) {
      return originalPrototype
    } else {
      return null
    }
  }

  function override(originalPrototype: object, propKey: string, handler: any) {
    const desc = Object.getOwnPropertyDescriptor(originalPrototype, propKey)
    if (desc === void 0) {
      console.error(
        `${name} cannot be observed, because the identified prototype has no ${propKey}.`
      )
      return
    }

    // Property descriptors are of two kinds.
    // https://262.ecma-international.org/15.0/index.html?_gl=1*1n9j7ka*_ga*ODUwMDQyMzQ2LjE3MjIwOTkzOTg.*_ga_TDCK4DWEPP*MTcyMjA5OTM5OC4xLjAuMTcyMjA5OTM5OC4wLjAuMA..#table-object-property-attributes
    if ("value" in desc) {
      // data property case
      Object.defineProperty(originalPrototype, propKey, {
        ...desc,
        value: new Proxy(desc.value, handler)
      })
    } else if ("get" in desc) {
      // accessor property case
      Object.defineProperty(originalPrototype, propKey, {
        ...desc,
        get: desc.get ? new Proxy(desc.get, handler) : undefined,
        set: desc.set ? new Proxy(desc.set, handler) : undefined
      })
    } else {
      console.error(
        `${name} cannot be observed, because the format of property descriptor is not as expected. The descriptor:`,
        desc
      )
    }
    return
  }

  function createProxyHandler(target: Target, isBoundThisLogEnabled: boolean) {
    const { apiName: name, debugInfo } = target
    return {
      // @ts-expect-error
      apply(target, thisArg, argumentsList) {
        originalLog("Arguments:", Array.from(argumentsList))

        const stack = originalError().stack!
        originalLog("Stack:", stack)

        isBoundThisLogEnabled && originalLog("BoundThis:", thisArg)

        postToDashboard(
          name,
          stack,
          argumentsList,
          isBoundThisLogEnabled ? thisArg : undefined
        )

        if (!!debugInfo) {
          if (
            ("args" in debugInfo &&
              stringifiedEqual(debugInfo.args, argumentsList)) ||
            ("boundThis" in debugInfo &&
              stringifiedEqual(debugInfo.boundThis, thisArg))
          ) {
            debugger
          }
        }

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
    let args: string[] = []
    for (const _arg of argsList) {
      let arg = ""
      try {
        // TODO: is this right?
        arg = _arg instanceof Object ? originalJSONStringify(_arg) : `${_arg}`
      } catch {
        arg = "*** CANNOT BE STRINGIFIED ***"
      }
      args.push(arg)
    }

    let boundThis: undefined | string = undefined
    try {
      boundThis = !!_boundThis ? originalJSONStringify(_boundThis) : undefined
    } catch {
      boundThis = "*** CANNOT BE STRINGIFIED ***"
    }

    originalPostMessage({
      url: originalLocationHref(),
      id: "whydunit" satisfies typeof MESSAGE_ID, // use literal because import statement cannot be used in this file
      type: "detected" satisfies typeof TYPE_DETECTED, // use literal because import statement cannot be used in this file
      name,
      stack,
      args,
      boundThis
    } satisfies DetectedMessageData)
  }

  function stringifiedEqual(a: unknown, b: unknown) {
    let result = false
    try {
      result = JSON.stringify(a) === JSON.stringify(b)
    } finally {
      return result
    }
  }
}
