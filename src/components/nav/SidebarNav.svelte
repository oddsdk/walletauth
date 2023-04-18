<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { sessionStore } from '$src/stores'
  import About from '$components/icons/About.svelte'
  import BrandLogo from '$components/icons/BrandLogo.svelte'
  import Home from '$components/icons/Home.svelte'
  import PhotoGallery from '$components/icons/PhotoGallery.svelte'
  import Settings from '$components/icons/Settings.svelte'
  import NavItem from '$components/nav/NavItem.svelte'

  const navItemsUpper = [
    {
      label: 'Home',
      href: '/',
      icon: Home
    },
    {
      label: 'Photo Gallery Demo',
      href: '/gallery/',
      icon: PhotoGallery
    },
    {
      label: 'Account Settings',
      href: '/settings/',
      icon: Settings
    }
  ]

  const navItemsLower = [
    {
      label: 'About This Template',
      href: '/about/',
      icon: About,
      placement: 'bottom'
    }
  ]

  let checked = false
  const handleCloseDrawer = (): void => {
    checked = false
  }
</script>

<!-- Only render the nav if the user is authed and not in the connection flow -->
{#if $sessionStore.authed && !$page.url.pathname.match(/register|backup|delegate/)}
  <div class="drawer drawer-mobile h-screen">
    <input
      id="sidebar-nav"
      class="drawer-toggle"
      type="checkbox"
      bind:checked
    />
    <div class="drawer-content flex flex-col">
      <slot />
    </div>
    <div class="drawer-side">
      <label
        for="sidebar-nav"
        class="drawer-overlay !bg-[#262626] !opacity-[.85]"
      />
      <div class="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
        <!-- Brand -->
        <button
          class="flex items-center gap-3 cursor-pointer mb-8"
          on:click={() => {
            handleCloseDrawer()
            goto('/')
          }}
        >
          <BrandLogo />
        </button>

        <!-- Upper Menu -->
        <ul>
          {#each navItemsUpper as item}
            <NavItem {item} {handleCloseDrawer} />
          {/each}
        </ul>

        <!-- Lower Menu -->
        <ul class="mt-auto pb-8">
          {#each navItemsLower as item}
            <NavItem {item} {handleCloseDrawer} />
          {/each}
        </ul>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}
