import * as guards from "@sniptt/guards"

import * as uint8arrays from "uint8arrays"


// 🛠


export function isStringArray(a: unknown): a is string[] {
  return guards.isArray(a) && a.every(guards.isString)
}