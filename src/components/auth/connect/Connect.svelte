<script lang="ts">
  import { initialise, copyAddressToClipboard } from '$lib/session'
  import { sessionStore } from '../../../stores'


</script>

{#if $sessionStore.authed}
  <div
    on:click={copyAddressToClipboard}
    class="hidden md:flex w-max max-w-[150px] cursor-pointer justify-between items-center rounded-full transition-colors duration-250 ease-in-out bg-gray-buttonDark dark:bg-gray-buttonLight border border-gray-900 dark:border-gray-50 group text-sm py-2 px-2"
  >
    <span
      class="overflow-hidden text-ellipsis w-[calc(100%-10px)] inline-block"
      >{$sessionStore?.address}</span
    >
  </div>
{:else}
  <button class="btn btn-sm h-10 btn-primary normal-case" on:click={initialise}>
    Connect
  </button>
{/if}
