import type { ProviderRpcError } from "eip1193-provider"

import * as guards from "@sniptt/guards"
import * as sigUtil from "@metamask/eth-sig-util"
import * as uint8arrays from "uint8arrays"
import { Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { isStringArray } from "./common"
import Web3Modal from "web3modal"


// 🌸


let globCurrentAccount: string | null = null
let globPublicEncryptionKey: Uint8Array | null = null



// ETHEREUM


export async function address(): Promise<string> {
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


export async function chainId(): Promise<string> {
  const ethereum = await load()
  const id = (await ethereum.getNetwork()).chainId
  return `eip155:${id}`
}


export async function decrypt(encryptedMessage: Uint8Array): Promise<Uint8Array> {
  const ethereum = await load()
  const account = await address()

  return ethereum
    .send("eth_decrypt", [ uint8arrays.toString(encryptedMessage, "utf8"), account ])
    .then(resp => {
      try {
        return JSON.parse(resp).data
      } catch (e) {
        return resp
      }
    })
    .then(resp => uint8arrays.fromString(resp, "utf8"))
}


export async function did(): Promise<string> {
  return `did:pkh:eip155:${await chainId()}:${await address()}`
}


export async function email(): Promise<string> {
  const chain = await chainId()
  return `${await address()}@0x${chain.toString(16)}.eth`
}


export async function encrypt(data: Uint8Array): Promise<Uint8Array> {
  const encryptionPublicKey = await publicEncryptionKey()

  // This gives us an object with the properties:
  // ciphertext, ephemPublicKey, nonce, version
  const encrypted = sigUtil.encryptSafely({
    publicKey: uint8arrays.toString(encryptionPublicKey, "base64pad"),
    data: uint8arrays.toString(data, "utf8"),
    version: "x25519-xsalsa20-poly1305",
  })

  // The RPC method `eth_decrypt` needs an object with these exact props,
  // hence the `JSON.stringify`.
  return uint8arrays.fromString(
    JSON.stringify(encrypted),
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


export async function publicEncryptionKey(): Promise<Uint8Array> {
  if (globPublicEncryptionKey) return globPublicEncryptionKey

  const ethereum = await load()
  const account = await address()

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

  globPublicEncryptionKey = uint8arrays.fromString(key, "base64pad")
  return globPublicEncryptionKey
}


export async function username(): Promise<string> {
  return address()
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