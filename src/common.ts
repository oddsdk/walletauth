import * as guards from "@sniptt/guards"


// 🛠


export function isStringArray(a: unknown): a is string[] {
  return guards.isArray(a) && a.every(guards.isString)
}