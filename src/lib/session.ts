import * as walletauth from 'webnative-walletauth'
import { Scenario } from 'webnative'
import { sessionStore } from '../stores'
import { addNotification } from '$lib/notifications'

export type Session = {
  authed: boolean
  loading: boolean
  error: boolean
}

// Initialise
export const initialise: () => Promise<void> = async () => {
  try {
    // Notify the user if their MetaMask is locked
    const isUnlocked = await window?.ethereum?._metamask.isUnlocked()
    if (!isUnlocked) {
      addNotification('Please unlock MetaMask to continue', 'error')
      return
    }

    sessionStore.update((state) => ({...state, loading: true}))

    const appState = await walletauth.app()

    switch (appState.scenario) {
      case Scenario.AuthSucceeded:
        // ✅ Authenticated
        sessionStore.update(state => ({ ...state, loading: false, authed: true }))
        addNotification('Wallet connected. You can now access your Webnative File System.', 'success')
        break

      case Scenario.NotAuthorised:
        // Failed to authenticate with wallet
        sessionStore.update(state => ({
          ...state,
          loading: false,
          authed: false,
          error: true,
        }))
        break
    }
  } catch (error) {
    console.error(error)
    sessionStore.update(state => ({ ...state, error: true, loading: false }))
  }
}
