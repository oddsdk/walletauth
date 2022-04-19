import * as wn from "webnative"
import * as ethereum from "./ethereum.js"


// ⛰


const FISSION_API_DID = "did:key:zStEZpzSMtTt9k2vszgvCwF4fLQQSyA15W5AQ4z3AR6Bx4eFJ5crJFbuGxKmbma4"



// WEBNATIVE


/**
 * Log into Fission with Ethereum.
 */
export async function login() {
  console.log(await ethereum.did())
  console.log(await ethereum.encrypt("Hello"))
}


export function createFissionAccount(did: string) {
  const ucan = wn.ucan.build({
    audience: FISSION_API_DID,
    issuer: did,
    expiration: (Math.floor(Date.now() / 1000) + 30),
    lifetimeInSeconds: 30
  })
}