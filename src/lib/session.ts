import * as ethers from 'ethers'
import { get as getStore } from 'svelte/store'
import { goto } from '$app/navigation'
import * as walletauth from 'webnative-walletauth'
import { AppScenario, leave } from 'webnative'
import { filesystemStore, sessionStore } from '../stores'
import { addNotification } from '$lib/notifications'
import {
  isUsernameAvailable
} from 'webnative/lobby/index'
import * as wn from 'webnative'
import * as auth from 'webnative/auth/index'

export type Session = {
  address: string
  authed: boolean
  loading: boolean
  error: boolean
}

export const testWebnative = async () => {
  // const [username] = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
  // console.log('username', username)
  // const isNewUser = await isUsernameAvailable(username)
  // console.log('isNewUser', isNewUser)

  // const res = await auth.register({ username })
  // console.log('res', res)

  // const res = await fetch(
  //   'https://runfission.com/v2/api/auth/ucan?ignore_time=true',
  //   {
  //     method: 'POST',
  //     body: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInVhdiI6IjAuMS4wIn0.eyJhdWQiOiJkaWQ6a2V5OnpTdEVacHpTTXRUdDlrMnZzemd2Q3dGNGZMUVFTeUExNVc1QVE0ejNBUjZCeDRlRko1Y3JKRmJ1R3hLbWJtYTQiLCJleHAiOjE1OTE2Mjc4NDEsImlzcyI6ImRpZDprZXk6ejEzVjNTb2cyWWFVS2hkR0NtZ3g5VVp1VzFvMVNoRkpZYzZEdkdZZTdOVHQ2ODlOb0wzazdIdXdCUXhKZFBqdllURHhFd3kxbTh3YjZwOTRjNm1NWTRmTnFBV0RkeVk3NVNWMnFEODVLNU1ZcVpqYUpZOGM0NzFBUEZydkpTZEo1QXo1REVDaENnV0xOdkVYRjJxaFlSMkZWaVprVGhvRVB0Mk5ZcHVxZ0txZVZvS1RpZkRpd3JYeUhka3hCazJNOWNQZE5HaGczRE0xWTZyVGY2RDJIZ2JlUnF2OGtvVW9xeWlLTWpYYUZTZlFZVkY3cGZGWGhOYWdKRGZqcG9xQ3FWWFllaTFQbU43UzM0cFdvcTZwUmRQczY5N2F4VVRFNXZQeXNlU3ROc3o4SGFqdUp2NzlDSENNZ2RvRkJzOXc3UHZNSFVEeGdHUWR0c3hBQXZKRzRxVGJkU0I2bUd2TFp0cGE5czFNemNIcDVEV1NjaUJxNnF1aG1SSHRTVFdHNW9FSnRTdlN4QlhTczJoZFBId0I0QVUiLCJuYmYiOjE1OTE2Mjc3NTEsInByZiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW5SNWNDSTZJa3BYVkNJc0luVmhkaUk2SWpBdU1TNHdJbjAuZXlKaGRXUWlPaUprYVdRNmEyVjVPbm94TTFZelUyOW5NbGxoVlV0b1pFZERiV2Q0T1ZWYWRWY3hiekZUYUVaS1dXTTJSSFpIV1dVM1RsUjBOamc1VG05TU0yczNTSFYzUWxGNFNtUlFhblpaVkVSNFJYZDVNVzA0ZDJJMmNEazBZelp0VFZrMFprNXhRVmRFWkhsWk56VlRWakp4UkRnMVN6Vk5XWEZhYW1GS1dUaGpORGN4UVZCR2NuWktVMlJLTlVGNk5VUkZRMmhEWjFkTVRuWkZXRVl5Y1doWlVqSkdWbWxhYTFSb2IwVlFkREpPV1hCMWNXZExjV1ZXYjB0VWFXWkVhWGR5V0hsSVpHdDRRbXN5VFRsalVHUk9SMmhuTTBSTk1WazJjbFJtTmtReVNHZGlaVkp4ZGpocmIxVnZjWGxwUzAxcVdHRkdVMlpSV1ZaR04zQm1SbGhvVG1GblNrUm1hbkJ2Y1VOeFZsaFpaV2t4VUcxT04xTXpOSEJYYjNFMmNGSmtVSE0yT1RkaGVGVlVSVFYyVUhselpWTjBUbk42T0VoaGFuVktkamM1UTBoRFRXZGtiMFpDY3psM04xQjJUVWhWUkhoblIxRmtkSE40UVVGMlNrYzBjVlJpWkZOQ05tMUhka3hhZEhCaE9YTXhUWHBqU0hBMVJGZFRZMmxDY1RaeGRXaHRVa2gwVTFSWFJ6VnZSVXAwVTNaVGVFSllVM015YUdSUVNIZENORUZWSWl3aVpYaHdJam94TlRrME1qRTVOelE0TENKcGMzTWlPaUprYVdRNmEyVjVPbm94TTFZelUyOW5NbGxoVlV0b1pFZERiV2Q0T1ZWYWRWY3hiekZUYUVaS1dXTTJSSFpIV1dVM1RsUjBOamc1VG05TU0wWjFRVlIwVlZCV1p6ZHBXRGQ0YlUxdGNrbzJNVE0wVkcxaE1tSkdWWE5YVVhreVRtUkhTREZYYVRSSWVVNWhOemh3VG0xU1RrRkdVRWhHU21KcVNqRnhZemc0TkZoeE1XbHlhV2wwY1ZKVk0zQmtkRVJSVFhobmIyRjNNVUptVFZkRlRVWnJkVmxWUm5Gd1JFdGlSMHd6WTNKQ2VtNUxkbFpNZDJsRGExQkhiM2h0V0VGWE4waFZOemw2TmxCVVRVZDVVMHRDUlVGMVdERjNSVE0wTlRKQ05rbzVOblphZFc5aVJUTlpZVUV5T0hsTFMwaE1OV2xxWmtKVVJFVTFaRTF6TmpWaFJraGlSbVZUZDNONlJtMWxkVkZxTkdkS1JEVklaMUJOYjI1bGRHZzNUSFZIWlhVMFlWVldWMFZDVkZKdk5sWmlTbFpRTVdKSVNqZHhUbUZRWW1JMFNrUjRTa2hFUkhaeFV6Vm9PRlJCZFZVMmIweFNUa1ZuTTJSdU4xSnBjV295VW1ST1ZYbFRkbkZxVkU0MWQzUk1VMjl3ZGtSNlFVSXllbFl5VUhSYWNETjJNVEZPYjJaRWEyNTJSWFpYYTBONmRYbFdRVnA1VFVGbk9HZGFXa2RESWl3aWJtSm1Jam94TlRreE5qSTNOamc0TENKd2RHTWlPaUpCVUZCRlRrUWlMQ0p6WTNBaU9pSXZJbjAuZWFIcmZuaFJkdy1ob1B3Q2RjVXpTX09abm5VXzFIR3RwU0JHenM1SmtDcGs5RlVQZVYwU2xVbF9kUkI0UzZ0M2xnbi14UHVoaVA3WE5kMGM3Qm9hZFd0SkxMSlY4VV9MZ2pUUUdMa1h4al9yVTZrYXA4bFRibllneDZPZzFiZi10bUhlVVVCNFZOY2RFUGlTMFRUYllMZlFDN05rLTZzbWkwekNYQlVBd1JrLURSQURtdkdhMzloVzFMQlFqWl9oejVhOVRYTTlRb0drS0szQkxDM2JVbXFKU1Y0SjVCTmlxanQ0TktqOUo1RjVYYjdHNTd4MkttWkVMYUw1U2NYV1lvWmpxVlJNWF9MY3k1WE4xaUJvWmFHVHlFbzlVNVBNYzhRSVRoaEdQTXNtc2JTS1cxc1AyUFF6OGNOUHh5b2NXYmZsT0dQZkVGZ21aenk4RGwxTkN3IiwicHRjIjoiQVBQRU5EIiwic2NwIjoiLyJ9'
  //   }
  // )
  // console.log('res', res)

  // Issue a signature
  const wallet = ethers.Wallet.fromMnemonic(
    'ENTER MNEMONIC HERE',
    "m/44'/60'/0'/0"
  )
  const message = 'Hello dapp'
  const signature = await wallet.signMessage(message)
  const expectedAddress = await wallet.getAddress()
  console.log('wallet', wallet)
  const expectedPublicKey = wallet.publicKey

  console.log('ISSUING SIGNATURE')
  console.log('ADDR:    ', expectedAddress)
  console.log('PUB K:   ', expectedPublicKey)
  console.log('SIG      ', signature)
  console.log()

  // Approach 1
  const actualAddress = ethers.utils.verifyMessage(message, signature)

  console.log('APPROACH 1')
  console.log('EXPECTED ADDR: ', expectedAddress)
  console.log('ACTUAL ADDR:   ', actualAddress)
  console.log()
}

/**
 * Ask the user to sign a message so we can use their wallet key to
 * create/attach their webnative file system
 */
export const initialise: () => Promise<void> = async () => {
  window.webnative = wn
  try {
    sessionStore.update(state => ({ ...state, loading: true }))

    // Point to staging instance
    walletauth.setup.debug({ enabled: true })
    walletauth.setup.endpoints({
      api: 'https://runfission.net',
      lobby: 'https://auth.runfission.net',
      user: 'fissionuser.net',
    })

    // Get the initial WNFS appState
    const initialAppState = await walletauth.app({
      onAccountChange: newAppState => handleAppState(newAppState),
    })

    // Populate session and filesystem stores
    handleAppState(initialAppState)
  } catch (error) {
    console.error(error)
    sessionStore.update(state => ({ ...state, error: true, loading: false }))
    addNotification(error.message, 'error')
  }
}

/**
 * Handle updates to the WNFS appState by setting the session and filesystem stores
 * @param appState
 */
const handleAppState = (appState) => {
  // Update FS store
  filesystemStore.update(() => (appState as any).fs)

  switch (appState.scenario) {
    case AppScenario.Authed:
      // ✅ Authenticated
      sessionStore.update(state => ({
        ...state,
        address: appState.username,
        authed: true,
        loading: false
      }))
      addNotification(
        'Wallet connected. You can now access your Webnative File System.',
        'success'
      )
      break

    case AppScenario.NotAuthed:
      // Failed to authenticate with wallet
      sessionStore.update(state => ({
        ...state,
        address: null,
        authed: false,
        error: true,
        loading: false
      }))
      break
  }
}

/**
 * Disconnect the user from their webnative session, reset the sessionStore and go to homepage
 */
export const disconnect: () => Promise<void> = async () => {
  await leave({ withoutRedirect: true })

  sessionStore.update(state => ({
    ...state,
    address: null,
    authed: false,
    loading: false,
    error: false,
  }))

  goto('/')
}

/**
 * Copy the user's address to the clipboard
 */
export const copyAddressToClipboard: () => Promise<void> = async () => {
  try {
    const session = getStore(sessionStore)
    await navigator.clipboard.writeText(session.address)
    addNotification('Address copied to clipboard', 'success')
  } catch (error) {
    console.error(error)
    addNotification('Failed to copy address to clipboard', 'error')
  }
}
