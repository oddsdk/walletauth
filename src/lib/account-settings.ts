import { get as getStore } from 'svelte/store'
import * as wn from 'webnative'
import * as uint8arrays from 'uint8arrays'
import type { CID } from 'multiformats/cid'
import type { PuttableUnixTree, File as WNFile } from 'webnative/fs/types'
import type { Metadata } from 'webnative/fs/metadata'

import { accountSettingsStore, filesystemStore } from '$src/stores'
import { addNotification } from '$lib/notifications'

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

type Link = {
  size: number
}

export const ACCOUNT_SETTINGS_DIR = ['private', 'settings']
const AVATAR_FILE_NAME = 'avatar'
const FILE_SIZE_LIMIT = 5

/**
 * Get the Avatar from the user's WNFS and construct its `src`
 */
export const getAvatarFromWNFS: () => Promise<void> = async () => {
  try {
    // Set loading: true on the accountSettingsStore
    accountSettingsStore.update(store => ({ ...store, loading: true }))

    const fs = getStore(filesystemStore)

    // Find the file that matches the AVATAR_FILE_NAME
    const path = wn.path.directory(...ACCOUNT_SETTINGS_DIR)
    const links = await fs.ls(path)
    const avatarLinks = Object.keys(links).filter(key =>
      key.includes(AVATAR_FILE_NAME)
    )

    // If user has not uploaded an avatar, silently fail and let the UI handle it
    if (!avatarLinks) {
      accountSettingsStore.update(store => ({
        ...store,
        loading: false
      }))
      return
    }

    const images = await Promise.all(
      avatarLinks.map(async (name) => {
        const file = await fs.get(
          wn.path.file(...ACCOUNT_SETTINGS_DIR, `${name}`)
        )

        // The CID for private files is currently located in `file.header.content`
        const cid = (file as AvatarFile).header.content.toString()

        // Create a base64 string to use as the image `src`
        const src = `data:image/jpeg;base64, ${uint8arrays.toString(
          (file as AvatarFile).content,
          'base64'
        )}`

        return {
          cid,
          ctime: (file as AvatarFile).header.metadata.unixMeta.ctime,
          name,
          size: (links[name] as Link).size,
          src
        }
      })
    )

    // Sort the newest images to the top of the list
    images.sort((a, b) => b.ctime - a.ctime)

    // The most recent avatar should be at the top of the list now
    const avatar = {
      cid: images[0].cid,
      ctime: images[0].ctime,
      name: AVATAR_FILE_NAME,
      src: images[0].src,
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
export const uploadImageToWNFS: (
  image: File
) => Promise<void> = async image => {
  try {
    const fs = getStore(filesystemStore)

    // Reject files over 5MB
    const imageSizeInMB = image.size / (1024 * 1024)
    if (imageSizeInMB > FILE_SIZE_LIMIT) {
      throw new Error('Image can be no larger than 5MB')
    }

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
      wn.path.file(...ACCOUNT_SETTINGS_DIR, updatedImage.name),
      updatedImage
    )

    // Announce the changes to the server
    await fs.publish()

    addNotification(`Your avatar has been updated!`, 'success')
  } catch (error) {
    addNotification(error.message, 'error')
    console.error(error)
  }
}

/**
 * Handle uploads made by interacting with the file input
 */
export const handleFileInput: (file: File) => Promise<void> = async file => {
  await uploadImageToWNFS(file)

  // Refetch avatar and update accountSettingsStore
  await getAvatarFromWNFS()
}
