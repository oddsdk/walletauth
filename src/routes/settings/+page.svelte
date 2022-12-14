<script lang="ts">
  import { goto } from '$app/navigation'
  import { sessionStore } from '$src/stores'
  import AvatarUpload from '$components/settings/AvatarUpload.svelte'
  import ThemePreferences from '$components/settings/ThemePreferences.svelte'
  import Address from '$components/settings/Address.svelte'
</script>

{#if $sessionStore.authed}
  <div
    class="min-h-[calc(100vh-128px)] md:min-h-[calc(100vh-160px)] pt-8 md:pt-16 flex flex-col items-start max-w-[690px] m-auto gap-10 pb-5 text-sm"
  >
    <h1 class="text-xl">Account Settings</h1>

    <div class="flex flex-col items-start justify-center gap-6">
      <AvatarUpload />

      <Address />

      <ThemePreferences />
    </div>
  </div>
{:else}
  {goto('/')}
{/if}
