<script lang="ts">
  import { onMount } from 'svelte'

  import '../global.css'
  import { appDescription, appName, appURL } from '$lib/app-info'
  import { TABLET_WIDTH } from '$lib/device'
  import { initialise } from '$lib/session'
  import { deviceStore, sessionStore, themeStore } from '../stores'
  import FullScreenLoadingSpinner from '$components/common/FullScreenLoadingSpinner.svelte'
  import Notifications from '$components/notifications/Notifications.svelte'
  import Footer from '$components/Footer.svelte'
  import Header from '$components/Header.svelte'
  import SidebarNav from '$components/nav/SidebarNav.svelte'

  onMount(async () => {
    await initialise()
    setDevice()
  })

  const setDevice = () => {
    if (window.innerWidth <= TABLET_WIDTH) {
      deviceStore.set({ isMobile: true })
    } else {
      deviceStore.set({ isMobile: false })
    }
  }
</script>

<svelte:head>
  <title>{appName}</title>

  <meta name="description" content={appDescription} />
  <meta property="og:title" content={appName} />
  <meta property="og:description" content={appDescription} />
  <meta property="og:url" content={appURL} />
  <meta name="twitter:title" content={appName} />
  <meta name="twitter:description" content={appDescription} />
  <meta name="twitter:image:alt" content={appName} />
</svelte:head>

<svelte:window on:resize={setDevice} />

<div data-theme={$themeStore.selectedTheme} class="min-h-screen">
  <Notifications />

  {#if $sessionStore.loading}
    <FullScreenLoadingSpinner />
  {:else}
    <SidebarNav>
      <Header />
      <div class="px-4">
      <slot />
      </div>
    </SidebarNav>
  {/if}
  <Footer />
</div>
