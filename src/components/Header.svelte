<script lang="ts">
  import { goto } from '$app/navigation'
  import { theme } from '../stores'
  import { storeTheme, type Theme } from '$lib/theme'
  import { appName } from '$lib/app-info'
  import Brand from '$components/icons/Brand.svelte'
  import LightMode from '$components/icons/LightMode.svelte'
  import DarkMode from '$components/icons/DarkMode.svelte'

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
<!--
  {#if !$sessionStore.loading && !$sessionStore.authed}
    <div class="flex-none">
      <a class="btn btn-sm h-10 btn-primary normal-case" href="/connect">
        Connect
      </a>
    </div>
  {/if} -->

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
