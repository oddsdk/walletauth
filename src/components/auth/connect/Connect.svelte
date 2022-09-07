<script lang="ts">
  import { addNotification } from '$lib/notifications';
  import { initialise } from '$lib/session'
  import { sessionStore } from '../../../stores'

  /**
   * Copy the user's address to the clipboard
   */
  const copyToClipboard: () => Promise<void> = async () => {
    try {
      await navigator.clipboard.writeText($sessionStore.address)
      addNotification('Address copied to clipboard', 'success')
    } catch (error) {
      console.error(error)
      addNotification('Failed to copy address to clipboard', 'error')
    }
  }
</script>

{#if $sessionStore.authed}
  <div
    on:click={copyToClipboard}
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
