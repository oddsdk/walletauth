<script lang="ts">
  import { goto } from '$app/navigation'
  import { sessionStore, themeStore } from '../stores'
  import { DEFAULT_THEME_KEY, storeTheme, type ThemeOptions } from '$lib/theme'
  import Avatar from '$components/settings/Avatar.svelte'
  import BrandLogo from '$components/icons/BrandLogo.svelte'
  import DarkMode from '$components/icons/DarkMode.svelte'
  import Hamburger from '$components/icons/Hamburger.svelte'
  import LightMode from '$components/icons/LightMode.svelte'

  const setTheme = (newTheme: ThemeOptions) => {
    localStorage.setItem(DEFAULT_THEME_KEY, 'false')
    themeStore.set({
      ...$themeStore,
      selectedTheme: newTheme,
      useDefault: false,
    })
    storeTheme(newTheme)
  }
</script>

<header class="navbar flex bg-base-100 pt-4">
  <div class="lg:hidden">
    {#if $sessionStore.authed}
      <label
        for="sidebar-nav"
        class="drawer-button cursor-pointer -translate-x-2"
      >
        <Hamburger />
      </label>
    {:else}
      <button
        class="flex items-center cursor-pointer gap-3"
        on:click={() => goto('/')}
      >
        <BrandLogo />
    </button>
    {/if}
  </div>

  <!-- Even if the user is not authed, render this header in the connection flow -->
  {#if !$sessionStore.authed}
    <button
      class="hidden lg:flex flex-1 items-center cursor-pointer gap-3"
      on:click={() => goto('/')}
    >
      <BrandLogo />
    </button>
  {/if}

  <div class="ml-auto flex items-center gap-2">
    {#if $sessionStore.authed}
      <a href="/settings">
        <Avatar size="small" />
      </a>
    {/if}

    {#if $themeStore.selectedTheme === 'light'}
      <button on:click={() => setTheme('dark')}>
        <LightMode />
      </button>
    {:else}
      <button on:click={() => setTheme('light')}>
        <DarkMode />
      </button>
    {/if}
  </div>
</header>
