/**
 * Util to convert a Uint8Array to a string
 * @param u8array
 * @returns string
 */
export const convertUint8ToString: (
  u8array: Uint8Array
) => string = u8array => {
  const CHUNK_SZ = 0x8000
  const c = []
  for (let i = 0; i < u8array.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8array.subarray(i, i + CHUNK_SZ)))
  }
  return c.join('')
}

/**
 * Generate a new uuid
 * @returns uuid
 */
export const uuid: () => string = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2)
