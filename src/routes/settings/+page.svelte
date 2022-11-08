<script lang="ts">
  import { goto } from '$app/navigation'
  import { sessionStore } from '$src/stores'
  import { copyAddressToClipboard, disconnect } from '$lib/session'
  import AvatarUpload from '$components/settings/AvatarUpload.svelte'
  import ThemePreferences from '$components/settings/ThemePreferences.svelte'
</script>

{#if $sessionStore.authed}
  <div
    class="min-h-[calc(100vh-128px)] md:min-h-[calc(100vh-160px)] pt-8 md:pt-16 flex flex-col items-start max-w-[690px] m-auto gap-10 pb-5 text-sm"
  >
    <h1 class="text-xl">Account Settings</h1>

    <div class="flex flex-col items-start justify-center gap-6">
      <div>
        <AvatarUpload />
      </div>

      <div>
        <h3 class="text-lg mb-4">Address</h3>
        <p class="cursor-pointer transition-colors hover:text-orange-300" on:click={copyAddressToClipboard}>{$sessionStore.address}</p>
      </div>

      <div>
        <ThemePreferences />
      </div>

      <div>
        <h3 class="text-lg mb-4">Disconnect Account</h3>
        <button class="btn btn-primary" on:click={disconnect}>Disconnect</button>
      </div>
    </div>
  </div>
{:else}
  {goto('/')}
{/if}
