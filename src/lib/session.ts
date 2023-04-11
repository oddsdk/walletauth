import { get as getStore } from 'svelte/store'
import { goto } from '$app/navigation'
import type * as odd from '@oddjs/odd'
import * as walletauth from '@oddjs/odd-walletauth'

import { filesystemStore, sessionStore } from '../stores'
import { initializeFilesystem } from '../routes/gallery/lib/gallery'
import { addNotification } from '$lib/notifications'
import { ACCOUNT_SETTINGS_DIR } from '$lib/account-settings'

export type Session = {
  address: string
  authed: boolean
  loading: boolean
  error: boolean
}

/**
 * Ask the user to sign a message so we can use their wallet key to
 * create/attach their odd file system
 */
export const initialise: () => Promise<void> = async () => {
  try {
    sessionStore.update(state => ({ ...state, loading: true }))

    // Get the initial WNFS appState
    const program = await walletauth.program({
      namespace: { creator: "Fission", name: "Walletauth Template" },

      onAccountChange: (p) => handleProgram(p),
      onDisconnect: () => disconnect(),
    })

    // Populate session and filesystem stores
    handleProgram(program)
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
const handleProgram = async (program: odd.Program) => {
  // Update FS store
  filesystemStore.update(() => program.session?.fs)

  // Create directories for the gallery
  await initializeFilesystem(program.session?.fs)

  if (program.session) {
    // Create directory for Account Settings
    await program.session.fs.mkdir(ACCOUNT_SETTINGS_DIR)

    // ✅ Authenticated
    sessionStore.update(state => ({
      ...state,
      address: program.session.username,
      authed: true,
      loading: false
    }))
    addNotification(
      'Wallet connected. You can now access your ODD File System.',
      'success'
    )

  } else {
    // Failed to authenticate with wallet
    sessionStore.update(state => ({
      ...state,
      address: null,
      authed: false,
      error: true,
      loading: false
    }))

  }
}

/**
 * Disconnect the user from their odd session, reset the sessionStore and go to homepage
 */
export const disconnect: () => Promise<void> = async () => {
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
