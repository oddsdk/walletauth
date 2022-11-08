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
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <meta name="googlebot" content="index,follow" />
  <meta name="description" content={appDescription} />
  <meta property="og:title" content={appName} />
  <meta property="og:description" content={appDescription} />
  <meta property="og:url" content={appURL} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="TODO" />
  <meta property="og:image:alt" content="WebNative Template" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={appName} />
  <meta name="twitter:description" content={appDescription} />
  <meta name="twitter:image" content="TODO" />
  <meta name="twitter:image:alt" content={appName} />

  <!-- See https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs for description. -->
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<svelte:window on:resize={setDevice} />

<div data-theme={$themeStore} class="min-h-screen">
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
