/// <reference types="@sveltejs/kit" />

import { MetaMaskInpageProvider } from '@metamask/providers';
/*
 * Window type extension to support ethereum
 */

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
