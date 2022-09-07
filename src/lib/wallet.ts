/**
 * Connect the user's MetaMask wallet
 */
export const connectWallet: () => Promise<void> = async () => {
  const isUnlocked = await window?.ethereum?._metamask.isUnlocked()
  console.log('isUnlocked', isUnlocked)
}
