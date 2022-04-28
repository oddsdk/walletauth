import "./index.css"

import * as uint8arrays from "uint8arrays"
import * as wn from "webnative"

import * as ethereum from "./ethereum.ts"
import * as webnative from "./webnative.ts"
import { Elm } from "./Application/Main.elm"


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

  console.log(
    await webnative.verifyUcanSignature(ucan)
  )
})()


export default app
