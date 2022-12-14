<script lang="ts">
  import { sessionStore } from '$src/stores'
  import { copyAddressToClipboard, } from '$lib/session'
  import ClipboardIcon from '$components/icons/ClipboardIcon.svelte'

</script>

<div>
  <h3 class="text-lg mb-4">Address</h3>
  <div class="flex items-center">
    <p>
      {$sessionStore.address}
    </p>
    <button
      class="pl-2 hover:text-neutral-500 transition-colors"
      on:click={copyAddressToClipboard}
    >
      <ClipboardIcon />
    </button>
  </div>
</div>
