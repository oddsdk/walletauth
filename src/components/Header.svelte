<script lang="ts">
  import { goto } from '$app/navigation'
  import { theme } from '../stores'
  import { storeTheme, type Theme } from '$lib/theme'
  import { appName } from '$lib/app-info'
  import Brand from '$components/icons/Brand.svelte'
  import Connect from '$components/auth/connect/Connect.svelte'
  import DarkMode from '$components/icons/DarkMode.svelte'
  import LightMode from '$components/icons/LightMode.svelte'

  const setTheme = (newTheme: Theme) => {
    theme.set(newTheme)
    storeTheme(newTheme)
  }
</script>

<header class="navbar bg-base-100 pt-0">
  <div class="flex-1 cursor-pointer hover:underline" on:click={() => goto('/')}>
    <Brand />
    <span class="text-xl ml-2">{appName}</span>
  </div>

  <div class="flex-none">
    <Connect />
  </div>

  <span class="ml-2">
    {#if $theme === 'light'}
      <span on:click={() => setTheme('dark')}>
        <LightMode />
      </span>
    {:else}
      <span on:click={() => setTheme('light')}>
        <DarkMode />
      </span>
    {/if}
  </span>
</header>
