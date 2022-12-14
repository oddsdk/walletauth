/**
 * File to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await new Blob([file]).arrayBuffer())
}
