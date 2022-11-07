import { get as getStore } from 'svelte/store'
import * as wn from 'webnative'
import type FileSystem from 'webnative/fs/index'
import * as uint8arrays from 'uint8arrays'
import type { CID } from 'multiformats/cid'
import type { PuttableUnixTree, File as WNFile } from 'webnative/fs/types'
import type { Metadata } from 'webnative/fs/metadata'

import { filesystemStore } from '$src/stores'
import { AREAS, galleryStore } from '$routes/gallery/stores'
import { addNotification } from '$lib/notifications'

export type Image = {
  cid: string
  ctime: number
  name: string
  private: boolean
  size: number
  src: string
}

export type Gallery = {
  publicImages: Image[] | null
  privateImages: Image[] | null
  selectedArea: AREAS
  loading: boolean
}

interface GalleryFile extends PuttableUnixTree, WNFile {
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

export const GALLERY_DIRS = {
  [AREAS.PUBLIC]: ['public', 'gallery'],
  [AREAS.PRIVATE]: ['private', 'gallery']
}
const FILE_SIZE_LIMIT = 5

/**
 * Create additional directories and files needed by the gallery if they don't exist
 *
 * @param fs FileSystem
 */

export const initializeFilesystem = async (fs: FileSystem): Promise<void> => {
  const publicPathExists = await fs.exists(
    wn.path.file(...GALLERY_DIRS[AREAS.PUBLIC])
  );
  const privatePathExists = await fs.exists(
    wn.path.file(...GALLERY_DIRS[AREAS.PRIVATE])
  );

  if (!publicPathExists) {
    await fs.mkdir(wn.path.directory(...GALLERY_DIRS[AREAS.PUBLIC]));
  }

  if (!privatePathExists) {
    await fs.mkdir(wn.path.directory(...GALLERY_DIRS[AREAS.PRIVATE]));
  }
};

/**
 * Get images from the user's WNFS and construct the `src` value for the images
 */
export const getImagesFromWNFS: () => Promise<void> = async () => {
  try {
    // Set loading: true on the galleryStore
    galleryStore.update(store => ({ ...store, loading: true }))

    const { selectedArea } = getStore(galleryStore)
    const isPrivate = selectedArea === AREAS.PRIVATE
    const fs = getStore(filesystemStore)

    // Set path to either private or public gallery dir
    const path = wn.path.directory(...GALLERY_DIRS[selectedArea])

    // Get list of links for files in the gallery dir
    const links = await fs.ls(path)

    const images = await Promise.all(
      Object.entries(links).map(async ([name]) => {
        const file = await fs.get(
          wn.path.file(...GALLERY_DIRS[selectedArea], `${name}`)
        )

        // The CID for private files is currently located in `file.header.content`,
        // whereas the CID for public files is located in `file.cid`
        const cid = isPrivate
          ? (file as GalleryFile).header.content.toString()
          : (file as GalleryFile).cid.toString()

        // Create a base64 string to use as the image `src`
        const src = `data:image/jpeg;base64, ${uint8arrays.toString(
          (file as GalleryFile).content,
          'base64'
        )}`

        return {
          cid,
          ctime: (file as GalleryFile).header.metadata.unixMeta.ctime,
          name,
          private: isPrivate,
          size: (links[name] as Link).size,
          src
        }
      })
    )

    // Sort images by ctime(created at date)
    // NOTE: this will eventually be controlled via the UI
    images.sort((a, b) => b.ctime - a.ctime)

    // Push images to the galleryStore
    galleryStore.update(store => ({
      ...store,
      ...(isPrivate
        ? {
            privateImages: images
          }
        : {
            publicImages: images
          }),
      loading: false
    }))
  } catch (error) {
    console.error(error)
    galleryStore.update(store => ({
      ...store,
      loading: false
    }))
  }
}

/**
 * Upload an image to the user's private or public WNFS
 * @param image
 */
export const uploadImageToWNFS: (
  image: File
) => Promise<void> = async image => {
  try {
    const { selectedArea } = getStore(galleryStore)
    const fs = getStore(filesystemStore)

    // Reject files over 5MB
    const imageSizeInMB = image.size / (1024 * 1024)
    if (imageSizeInMB > FILE_SIZE_LIMIT) {
      throw new Error('Image can be no larger than 5MB')
    }

    // Reject the upload if the image already exists in the directory
    const imageExists = await fs.exists(
      wn.path.file(...GALLERY_DIRS[selectedArea], image.name)
    )
    if (imageExists) {
      throw new Error(`${image.name} image already exists`)
    }

    // Create a sub directory and add some content
    await fs.write(
      wn.path.file(...GALLERY_DIRS[selectedArea], image.name),
      image
    )

    // Announce the changes to the server
    await fs.publish()

    addNotification(`${image.name} image has been published`, 'success')
  } catch (error) {
    addNotification(error.message, 'error')
    console.error(error)
  }
}

/**
 * Delete an image from the user's private or public WNFS
 * @param name
 */
export const deleteImageFromWNFS: (
  name: string
) => Promise<void> = async name => {
  try {
    const { selectedArea } = getStore(galleryStore)
    const fs = getStore(filesystemStore)

    const imageExists = await fs.exists(
      wn.path.file(...GALLERY_DIRS[selectedArea], name)
    )

    if (imageExists) {
      // Remove images from server
      await fs.rm(wn.path.file(...GALLERY_DIRS[selectedArea], name))

      // Announce the changes to the server
      await fs.publish()

      addNotification(`${name} image has been deleted`, 'success')

      // Refetch images and update galleryStore
      await getImagesFromWNFS()
    } else {
      throw new Error(`${name} image has already been deleted`)
    }
  } catch (error) {
    addNotification(error.message, 'error')
    console.error(error)
  }
}

/**
 * Handle uploads made by interacting with the file input directly
 */
export const handleFileInput: (
  files: FileList
) => Promise<void> = async files => {
  await Promise.all(
    Array.from(files).map(async file => {
      await uploadImageToWNFS(file)
    })
  )

  // Refetch images and update galleryStore
  await getImagesFromWNFS()
}
