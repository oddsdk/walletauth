import type { ProviderRpcError } from "eip1193-provider"

import * as guards from "@sniptt/guards"
import * as secp from "@noble/secp256k1"
import * as sigUtil from "@metamask/eth-sig-util"
import * as uint8arrays from "uint8arrays"
import { Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { keccak_256 } from "@noble/hashes/sha3"
import Web3Modal from "web3modal"

import { isStringArray } from "./common"


// ⛰


type Signature = {
  r: Uint8Array
  s: Uint8Array

  recoveryParam: number
  v: number

  compact: Uint8Array
  full: Uint8Array
}


export const MSG_TO_SIGN = uint8arrays.fromString("Hello there, would you like to sign this so we can generate a DID?", "utf8")



// 🌸


let globCurrentAccount: string | null = null
let globPublicEncryptionKey: Uint8Array | null = null
let globPublicSignatureKey: Uint8Array | null = null



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


export async function chainId(): Promise<number> {
  const ethereum = await load()
  const id = (await ethereum.getNetwork()).chainId
  return id
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


export async function publicSignatureKey(): Promise<Uint8Array> {
  if (globPublicSignatureKey) return globPublicSignatureKey

  const signature = await sign(MSG_TO_SIGN)
  const signatureParts = deconstructSignature(signature)

  globPublicSignatureKey = secp.recoverPublicKey(
    hashMessage(MSG_TO_SIGN),
    signatureParts.full,
    signatureParts.recoveryParam
  )

  return globPublicSignatureKey
}


export async function sign(data: Uint8Array): Promise<Uint8Array> {
  const ethereum = await load()

  return ethereum.send(
    "personal_sign",
    [
      uint8arrays.toString(data, "hex"),
      await address()
    ]
  ).then(
    uint8ArrayFromEthereumHex
  )
}


export async function username(): Promise<string> {
  return address()
}



// 🛠


export function deconstructSignature(signature: Uint8Array): Signature {
  const parts = ethers.utils.splitSignature(signature)

  const r = uint8ArrayFromEthereumHex(parts.r)
  const s = uint8ArrayFromEthereumHex(parts.s)

  return {
    r, s,

    recoveryParam: parts.recoveryParam,
    v: parts.v,

    compact: uint8ArrayFromEthereumHex(parts.compact),
    full: uint8arrays.concat([ r, s ])
  }
}


export function hashMessage(message: Uint8Array): Uint8Array {
  return keccak_256(
    uint8arrays.concat([ signedMessagePrefix(message), message ])
  )
}


export function signedMessagePrefix(message: Uint8Array): Uint8Array {
  return uint8arrays.fromString(
    `\x19Ethereum Signed Message:\n${message.length}`,
    "utf8"
  )
}


export function uint8ArrayFromEthereumHex(data: string): Uint8Array {
  return uint8arrays.fromString(data.substring(2), "hex")
}


export function uint8ArrayToEthereumHex(data: Uint8Array): string {
  return "0x" + uint8arrays.toString(data, "hex")
}



// 🔬


export async function verifyPublicKey(): Promise<boolean> {
  return verifySignedMessage({
    signature: await sign(MSG_TO_SIGN),
    message: MSG_TO_SIGN,
    publicKey: await publicSignatureKey()
  })
}


export async function verifySignedMessage(
  { signature, message, publicKey }:
  { signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array }
): Promise<boolean> {
  return secp.verify(
    deconstructSignature(signature).full,
    hashMessage(message),
    publicKey
  )
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