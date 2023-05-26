import type { GetSnapsResponse, Snap } from '../global';

// reliant on running my fork of skgbafa's repo in parallel for now: 
// https://github.com/depatchedmode/dessi
const defaultSnapOrigin = `local:http://localhost:8080`;

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'hello' } },
  });
};

/**
 * Invoke the "eth_getEncryptionPublicKey" method from the snap.
 *
 * @param account - The account to get the public key for.
 * @returns The public key.
 */
export const getEncryptionPublicKey = async (account: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'eth_getEncryptionPublicKey',
        params: [account],
      },
    },
  });
};

/**
 * Invoke the "eth_decrypt" method from the snap.
 *
 * @param encryptedMessage - The encrypted message to decrypt.
 * @param account - The account to decrypt the message with.
 * @returns The decrypted message.
 */
export const decrypt = async (encryptedMessage: string, account: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'eth_decrypt',
        params: [{
          version: "secp256k1-sha512kdf-aes256cbc-hmacsha256",
          ciphertext: encryptedMessage
        }, account],
      },
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
