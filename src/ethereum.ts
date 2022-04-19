import type { EIP1193Provider, ProviderRpcError } from "eip1193-provider"

import { BASE58_DID_PREFIX } from "webnative/did/util.js"
import { isStringArray } from "./common"
import * as guards from "@sniptt/guards"
import * as sigUtil from "@metamask/eth-sig-util"
import * as uint8arrays from "uint8arrays"


// 🌸


let globCurrentAccount: string | null = null
let globPublicKey: Uint8Array | null = null



// ETHEREUM


export async function did() {
  const pubKey = await publicKey()
  const prefix = [ 0xec, 0x01 ]

  const prefixedBytes = uint8arrays.concat([ prefix, pubKey ])

  // Encode prefixed
  return BASE58_DID_PREFIX + uint8arrays.toString(prefixedBytes, "base58btc")
}


export async function encrypt(data: string) {
  const encryptionPublicKey = await publicKey()

  return uint8arrays.fromString(
    JSON.stringify(
      sigUtil.encrypt({
        publicKey: uint8arrays.toString(encryptionPublicKey, "base64pad"),
        data: data,
        version: "x25519-xsalsa20-poly1305",
      })
    ),
    "utf8"
  )
}


export async function publicKey(): Promise<Uint8Array> {
  if (globPublicKey) return globPublicKey

  const ethereum = await load()
  const account = await loadAccount()

  const key: unknown = await ethereum
    .request({
      method: "eth_getEncryptionPublicKey",
      params: [ account ]
    })
    .catch((error: ProviderRpcError) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log("We can't encrypt anything without the key.")
      } else {
        console.error(error)
      }
    })

  if (!guards.isString(key)) {
    throw new Error("Expected ethereumPublicKey to be a string")
  }

  globPublicKey = uint8arrays.fromString(key, "base64pad")
  return globPublicKey
}


export function load(): Promise<EIP1193Provider> {
  let eth

  // deno-lint-ignore no-explicit-any
  if ("ethereum" in window) eth = (window as any).ethereum
  else throw new Error("Cannot load Ethereum/Metamask")

  // events
  eth.on("accountsChanged", handleAccountsChanged)

  // fin
  return eth
}


export async function loadAccount(): Promise<string> {
  if (globCurrentAccount) return globCurrentAccount

  const ethereum = await load()

  await ethereum
    .request({ method: "eth_accounts" })
    .then(handleAccountsChanged)
    .catch((err: ProviderRpcError) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err)
    })

  if (!globCurrentAccount) {
    throw new Error("Failed to retrieve Ethereum account")
  }

  return globCurrentAccount
}



// ㊙️


function handleAccountsChanged(accounts: unknown) {
  if (isStringArray(accounts)) {
    if (!accounts[0]) {
      console.warn("Please connect to Ethereum/Metamask.")
    } else if (accounts[0] !== globCurrentAccount) {
      globCurrentAccount = accounts[0]
    }
  }
}