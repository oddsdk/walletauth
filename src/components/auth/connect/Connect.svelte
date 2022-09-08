<script lang="ts">
  import { disconnect, copyAddressToClipboard, initialise } from '$lib/session'
  import { sessionStore } from '../../../stores'
</script>

{#if $sessionStore.authed}
  <div class="dropdown dropdown-end">
    <label tabindex="0" for="connectDropdown" class="m-1 hidden md:flex w-max max-w-[150px] cursor-pointer justify-between items-center rounded-full transition-colors duration-250 ease-in-out bg-gray-buttonDark dark:bg-gray-buttonLight border border-gray-900 dark:border-gray-50 group text-sm py-2 pr-2 pl-3"><span
      class="overflow-hidden text-ellipsis w-full inline-block"
      >{$sessionStore?.address}</span
    ></label>
    <ul tabindex="0" id="connectDropdown" class="dropdown-content card card-bordered border-gray-900 dark:border-gray-50 menu p-2 shadow bg-base-100 rounded-box text-sm w-[150px]">
      <li><button on:click={copyAddressToClipboard} class="inline-block text-right">Copy Address</button></li>
      <li><button on:click={disconnect} class="inline-block text-right">Disconnect</button></li>
    </ul>
  </div>
{:else}
  <button class="btn btn-sm h-10 btn-primary normal-case" on:click={initialise}>
    Connect
  </button>
{/if}
