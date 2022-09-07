import { get as getStore } from 'svelte/store'
import * as walletauth from 'webnative-walletauth'
import { AppScenario } from 'webnative'
import { filesystemStore, sessionStore } from '../stores'
import { addNotification } from '$lib/notifications'

export type Session = {
  address: string
  authed: boolean
  loading: boolean
  error: boolean
}

/**
 * Ask the user to sign a message so we can use their wallet key to
 * create/attach their webnative file system
 */
export const initialise: () => Promise<void> = async () => {
  try {
    // Point to staging instance
    walletauth.setup.debug({ enabled: true })
    walletauth.setup.endpoints({
      api: 'https://runfission.net',
      lobby: 'https://auth.runfission.net',
      user: 'fissionuser.net'
    })

    sessionStore.update((state) => ({...state, loading: true}))

    const appState = await walletauth.app()

    // Update FS store
    filesystemStore.update(() => (appState as any).fs)

    switch (appState.scenario) {
      case AppScenario.Authed:
        // ✅ Authenticated
        sessionStore.update(state => ({
          ...state,
          address: appState.username,
          authed: true,
          loading: false,
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
          loading: false,
        }))
        break
    }
  } catch (error) {
    console.error(error)
    sessionStore.update(state => ({ ...state, error: true, loading: false }))
  }
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
