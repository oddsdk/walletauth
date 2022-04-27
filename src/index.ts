import "./index.css"

import { Elm } from "./Application/Main.elm"
import { hasFissionAccount } from "./webnative.ts"
import * as ethereum from "./ethereum.ts"


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


// ;(async () => {
//   console.log(await ethereum.verifyPublicKey())
// })()


export default app
