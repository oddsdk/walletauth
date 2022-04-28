import "./index.css"

import * as uint8arrays from "uint8arrays"
import * as wn from "webnative"

import { Elm } from "./Application/Main.elm"
import * as ethereum from "./ethereum.ts"
import * as webnative from "./webnative.ts"


// 🚀


const app = Elm.Main.init({
  node: document.getElementById("app"),
  flags: {}
})



// PORTS


// app.ports.createFissionAccount.subscribe(async () => {
//   // 1. Create Ethereum DID by recovering the public key
//   // 2. Create Fission account with that DID (through a UCAN)
// })


// app.ports.hasFissionAccount.subscribe(async () => {
//   const hasAccount = await hasFissionAccount(await ethereum.username())
//   app.ports.replyForHasFissionAccount.send(hasAccount)
// })


;(async () => {
  const ucan = await webnative.createUcan({
    audience: webnative.FISSION_API_DID,
    issuer: await ethereum.did(),
    lifetimeInSeconds: 30
  })

  const message = uint8arrays.fromString(
    `${wn.ucan.encodeHeader(ucan.header)}.${wn.ucan.encodePayload(ucan.payload)}`,
    "utf8"
  )

  const signature = uint8arrays.fromString(
    ucan.signature,
    "base64url"
  )

  const isValid = await ethereum.verifySignedMessage({
    signature: signature,
    message
  })

  console.log(
    isValid
  )
})()


export default app
