import * as uint8arrays from "uint8arrays"
import * as wn from "webnative"

import { decodeCID } from "webnative/common/cid"
import { getSimpleLinks } from "webnative/fs/protocol/basic"
import RootTree from "webnative/fs/root/tree"
import { PublicFile } from "webnative/fs/v1/PublicFile"
import { PublicTree } from "webnative/fs/v1/PublicTree"

import { Resource, Ucan } from "webnative/ucan/types"

import * as ethereum from "./ethereum.js"


// ⛰


const FISSION_API_DID = "did:key:zStEZpzSMtTt9k2vszgvCwF4fLQQSyA15W5AQ4z3AR6Bx4eFJ5crJFbuGxKmbma4"
const WNFS_PERMISSIONS = { fs: { private: [ wn.path.root() ], public: [ wn.path.root() ] }}
const READ_KEY_PATH = wn.path.file(wn.path.Branch.Public, ".well-known", "read-key")



// 🚀


/**
 * Log into Fission with Ethereum.
 */
export async function login() {
  let dataRoot

  const username = await ethereum.username()

  // Create user if necessary
  console.log("Looking up data root")
  dataRoot = await wn.dataRoot.lookup(username)

  if (!dataRoot) {
    console.log("Creating new Fission account")
    const { success } = await createFissionAccount(await ethereum.did())
    if (!success) manageError("Failed to create Fission user")
  }

  // Load, or create, WNFS
  let fs

  if (!dataRoot) {
    // New user
    const readKey = await wn.crypto.aes.genKeyStr()

    console.log("Creating new WNFS")
    fs = await wn.fs.empty({
      permissions: WNFS_PERMISSIONS,
      rootKey: readKey,
      localOnly: true
    })

    await fs.write(
      READ_KEY_PATH,
      await encryptReadKey(readKey)
    )

    await fs.mkdir(wn.path.directory("private", "Apps"))
    await fs.mkdir(wn.path.directory("private", "Audio"))
    await fs.mkdir(wn.path.directory("private", "Documents"))
    await fs.mkdir(wn.path.directory("private", "Photos"))
    await fs.mkdir(wn.path.directory("private", "Video"))

  } else {
    // Existing user
    const publicCid = decodeCID((await getSimpleLinks(dataRoot)).public.cid)
    const publicTree = await PublicTree.fromCID(publicCid)
    const unwrappedPath = wn.path.unwrap(READ_KEY_PATH)
    const readKeyChild = await publicTree.get(unwrappedPath)

    if (!PublicFile.instanceOf(readKeyChild)) {
      throw new Error(`Did not expect a tree at: ${wn.path.log(unwrappedPath)}`)
    }

    const encryptedReadKey = readKeyChild.content
    if (encryptedReadKey.constructor.name !== "Uint8Array") {
      throw new Error("The read key was not a Uint8Array as we expected")
    }

    const readKey = await decryptReadKey(encryptedReadKey as Uint8Array)
    RootTree.storeRootKey(readKey)

    fs = await wn.fs.fromCID(
      dataRoot,
      { localOnly: true, permissions: WNFS_PERMISSIONS }
    )

  }
}


export async function createFissionAccount(did: string) {
  const endpoints = wn.setup.endpoints({})
  const apiEndpoint = `${endpoints.api}/${endpoints.apiVersion}/api`

  // Create UCAN
  const ucan = wn.ucan.encode(await createUcan({
    audience: FISSION_API_DID,
    issuer: did,
    lifetimeInSeconds: 30
  }))

  // API request
  const response = await fetch(`${apiEndpoint}/user`, {
    method: "PUT",
    headers: {
      "authorization": `Bearer ${ucan}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email: await ethereum.email(),
      username: await ethereum.username()
    })
  })

  return {
    success: response.status < 300
  }
}


export async function hasFissionAccount(username: string): Promise<boolean> {
  const dataRoot = await wn.dataRoot.lookup(username)
  return !!dataRoot
}



// 🛠


export async function createUcan({
  audience,
  issuer,
  lifetimeInSeconds,
  potency,
  proof,
  resource
}: {
  audience: string
  issuer: string
  lifetimeInSeconds: number
  potency?: string
  proof?: string
  resource?: Resource
}): Promise<Ucan> {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000)

  const header = {
    alg: "SECP256K1",
    typ: "JWT",
    uav: "1.0.0"
  }

  const payload = {
    aud: audience,
    exp: currentTimeInSeconds + lifetimeInSeconds,
    fct: [],
    iss: issuer,
    nbf: currentTimeInSeconds - 60,
    prf: proof || null,
    ptc: potency,
    rsc: resource || "*",
  }

  const encodedHeader = wn.ucan.encodeHeader(header)
  const encodedPayload = wn.ucan.encodePayload(payload)
  const signature = uint8arrays.toString(
    await ethereum.sign(
      uint8arrays.fromString(
        `${encodedHeader}.${encodedPayload}`,
        "utf8"
      )
    ),
    "base64url"
  )

  return {
    header,
    payload,
    signature
  }
}


export async function decryptReadKey(encrypted: Uint8Array): Promise<string> {
  return uint8arrays.toString(
    await ethereum.decrypt(encrypted),
    "base64pad"
  )
}


export function encryptReadKey(readKey: string): Promise<Uint8Array> {
  return ethereum.encrypt(
    uint8arrays.fromString(readKey, "base64pad")
  )
}


export async function verifyUcanSignature(ucan: Ucan): Promise<boolean> {
  const message = uint8arrays.fromString(
    `${wn.ucan.encodeHeader(ucan.header)}.${wn.ucan.encodePayload(ucan.payload)}`,
    "utf8"
  )

  const signature = uint8arrays.fromString(
    ucan.signature || "",
    "base64url"
  )

  return ethereum.verifySignedMessage({
    signature: signature,
    message,
    publicKey: await ethereum.publicSignatureKey()
  })
}



// ㊙️


function manageError(err: string) {
  alert(`Error: ${err}`)
  throw new Error(err)
}