<script lang="ts">
  import { disconnect, copyAddressToClipboard, initialise } from '$lib/session'
  import { sessionStore } from '$src/stores'
  import Connect from '$components/icons/Connect.svelte'
</script>

{#if $sessionStore.authed}
  <div class="dropdown dropdown-end">
    <label for="connectDropdown" class="m-1 hidden md:flex w-max max-w-[150px] cursor-pointer justify-between items-center rounded-full border dark:text-gray-50 dark:border-gray-50 border-slate-900 bg-gray-50 dark:bg-slate-900 hover:text-gray-50 hover:bg-slate-900 dark:hover:text-slate-900 dark:hover:bg-gray-50 transition-colors duration-250ms ease-in-out group text-sm py-2 pr-2 pl-3"><span
      class="overflow-hidden text-ellipsis w-full inline-block"
      >{$sessionStore?.address}</span
    ></label>
    <ul id="connectDropdown" class="dropdown-content card card-bordered border-gray-900 dark:border-gray-50 menu p-2 shadow bg-base-100 rounded-box text-sm w-[150px]">
      <li><button on:click={copyAddressToClipboard} class="inline-block text-right">Copy Address</button></li>
      <li><button on:click={disconnect} class="inline-block text-right">Disconnect</button></li>
    </ul>
  </div>
{:else}
  <button class="btn btn-primary !btn-lg !h-10 gap-2" on:click={initialise}>
    <Connect /> Connect this device
  </button>
{/if}
