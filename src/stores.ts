import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type FileSystem from '@oddjs/odd/fs/index'

import { loadTheme } from '$lib/theme'
import type { AccountSettings } from '$lib/account-settings'
import type { Device } from '$lib/device'
import type { Notification } from '$lib/notifications'
import type { Session } from '$lib/session'
import type { Theme } from '$lib/theme'

export const themeStore: Writable<Theme> = writable(loadTheme())

export const filesystemStore: Writable<FileSystem | null> = writable(null)

export const deviceStore: Writable<Device> = writable({ isMobile: true })

export const notificationStore: Writable<Notification[]> = writable([])

export const sessionStore: Writable<Session> = writable({
  address: null,
  authed: false,
  loading: false,
  error: false,
})

export const accountSettingsStore: Writable<AccountSettings> = writable({
  avatar: null,
  loading: true
})
