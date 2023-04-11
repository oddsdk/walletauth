import { get as getStore } from 'svelte/store'
import * as odd from '@oddjs/odd'
import * as uint8arrays from 'uint8arrays'
import type { CID } from 'multiformats/cid'
import type { PuttableUnixTree, File as WNFile } from '@oddjs/odd/fs/types'
import type { Metadata } from '@oddjs/odd/fs/metadata'

import { accountSettingsStore, filesystemStore } from '$src/stores'
import { addNotification } from '$lib/notifications'
import { fileToUint8Array } from '$lib/utils'

export type Avatar = {
  cid: string
  ctime: number
  name: string
  size?: number
  src: string
}

export type AccountSettings = {
  avatar: Avatar
  loading: boolean
}
interface AvatarFile extends PuttableUnixTree, WNFile {
  cid: CID
  content: Uint8Array
  header: {
    content: Uint8Array
    metadata: Metadata
  }
}

export const ACCOUNT_SETTINGS_DIR = odd.path.directory('private', 'settings')
const AVATAR_DIR = odd.path.combine(
  ACCOUNT_SETTINGS_DIR,
  odd.path.directory('avatars')
)
const AVATAR_ARCHIVE_DIR = odd.path.combine(
  AVATAR_DIR,
  odd.path.directory('archive')
)
const AVATAR_FILE_NAME = 'avatar'
const FILE_SIZE_LIMIT = 20

/**
 * Move old avatar to the archive directory
 */
const archiveOldAvatar = async (): Promise<void> => {
  const fs = getStore(filesystemStore)

  // Return if user has not uploaded an avatar yet
  const avatarDirExists = await fs.exists(AVATAR_DIR)
  if (!avatarDirExists) {
    return
  }

  // Find the filename of the old avatar
  const path = AVATAR_DIR
  const links = await fs.ls(path)
  const oldAvatarFileName = Object.keys(links).find(key =>
    key.includes(AVATAR_FILE_NAME)
  )
  const oldFileNameArray = oldAvatarFileName.split('.')[0]
  const archiveFileName = `${oldFileNameArray[0]}-${Date.now()}.${
    oldFileNameArray[1]
  }`

  // Move old avatar to archive dir
  const fromPath = odd.path.combine(AVATAR_DIR, odd.path.file(oldAvatarFileName))
  const toPath = odd.path.combine(
    AVATAR_ARCHIVE_DIR,
    odd.path.file(archiveFileName)
  )
  await fs.mv(fromPath, toPath)

  // Announce the changes to the server
  await fs.publish()
}

/**
 * Get the Avatar from the user's WNFS and construct its `src`
 */
export const getAvatarFromWNFS = async (): Promise<void> => {
  try {
    // Set loading: true on the accountSettingsStore
    accountSettingsStore.update(store => ({ ...store, loading: true }))

    const fs = getStore(filesystemStore)

    // If the avatar dir doesn't exist, silently fail and let the UI handle it
    const avatarDirExists = await fs.exists(AVATAR_DIR)
    if (!avatarDirExists) {
      accountSettingsStore.update(store => ({
        ...store,
        loading: false
      }))
      return
    }

    // Find the file that matches the AVATAR_FILE_NAME
    const path = AVATAR_DIR
    const links = await fs.ls(path)
    const avatarName = Object.keys(links).find(key =>
      key.includes(AVATAR_FILE_NAME)
    )

    // If user has not uploaded an avatar, silently fail and let the UI handle it
    if (!avatarName) {
      accountSettingsStore.update(store => ({
        ...store,
        loading: false
      }))
      return
    }

    const file = await fs.get(
      odd.path.combine(AVATAR_DIR, odd.path.file(`${avatarName}`))
    )

    // The CID for private files is currently located in `file.header.content`
    const cid = (file as AvatarFile).header.content.toString()

    // Create a base64 string to use as the image `src`
    const src = `data:image/jpeg;base64, ${uint8arrays.toString(
      (file as AvatarFile).content,
      'base64'
    )}`

    const avatar = {
      cid,
      ctime: (file as AvatarFile).header.metadata.unixMeta.ctime,
      name: avatarName,
      src
    }

    // Push images to the accountSettingsStore
    accountSettingsStore.update(store => ({
      ...store,
      avatar,
      loading: false
    }))
  } catch (error) {
    console.error(error)
    accountSettingsStore.update(store => ({
      ...store,
      avatar: null,
      loading: false
    }))
  }
}

/**
 * Upload an avatar image to the user's private WNFS
 * @param image
 */
export const uploadAvatarToWNFS = async (image: File): Promise<void> => {
  try {
    // Set loading: true on the accountSettingsStore
    accountSettingsStore.update(store => ({ ...store, loading: true }))

    const fs = getStore(filesystemStore)

    // Reject files over 5MB
    const imageSizeInMB = image.size / (1024 * 1024)
    if (imageSizeInMB > FILE_SIZE_LIMIT) {
      throw new Error('Image can be no larger than 5MB')
    }

    // Archive old avatar
    await archiveOldAvatar()

    // Rename the file to `avatar.[extension]`
    const updatedImage = new File(
      [image],
      `${AVATAR_FILE_NAME}.${image.name.split('.')[1]}`,
      {
        type: image.type
      }
    )

    // Create a sub directory and add the avatar
    await fs.write(
      odd.path.combine(AVATAR_DIR, odd.path.file(updatedImage.name)),
      await fileToUint8Array(updatedImage)
    )

    // Announce the changes to the server
    await fs.publish()

    addNotification(`Your avatar has been updated!`, 'success')
  } catch (error) {
    addNotification(error.message, 'error')
    console.error(error)
  }
}
