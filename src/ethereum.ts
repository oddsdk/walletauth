import type { ProviderRpcError } from "eip1193-provider"

import * as guards from "@sniptt/guards"
import * as sigUtil from "@metamask/eth-sig-util"
import * as uint8arrays from "uint8arrays"
import { BASE58_DID_PREFIX } from "webnative/did/util.js"
import { Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { isStringArray } from "./common"
import Web3Modal from "web3modal"


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


export function email() {
  return "anonymous@0x.eth"
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


export async function load(): Promise<Web3Provider> {
  const web3Modal = new Web3Modal()
  const instance = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(instance)

  // events
  provider.on("accountsChanged", handleAccountsChanged)

  // fin
  return provider
}


export async function loadAccount(): Promise<string> {
  if (globCurrentAccount) return globCurrentAccount

  const ethereum = await load()

  await ethereum
    .send("eth_accounts", [])
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


export async function publicKey(): Promise<Uint8Array> {
  if (globPublicKey) return globPublicKey

  const ethereum = await load()
  const account = await loadAccount()

  const key: unknown = await ethereum
    .send(
      "eth_getEncryptionPublicKey",
      [ account ]
    )
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


export async function username() {
  return "0x" + uint8arrays.toString(await publicKey(), "hex")
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