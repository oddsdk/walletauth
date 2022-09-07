<script lang="ts">
  import { onDestroy } from 'svelte'

  import { sessionStore } from '../stores'
  import { appName } from '$lib/app-info'
  import { copyAddressToClipboard, type Session } from '$lib/session'

  let session: Session

  const unsubscribe = sessionStore.subscribe(val => {
    session = val
  })

  onDestroy(unsubscribe)
</script>

<div class="grid grid-flow-row auto-rows-max gap-5 justify-items-center pb-5">
  <h1 class="text-2xl">Welcome to {appName}!</h1>

  {#if session?.authed}
    <div class="card card-bordered w-96 dark:border-slate-600">
      <div class="card-body">
        <h2 class="card-title">👋 Account</h2>
        <p>
          Your address is:
          <span
            on:click={copyAddressToClipboard}
            class="inline-block px-2 mt-2 cursor-pointer font-mono bg-slate-300 dark:bg-slate-700 rounded-md overflow-hidden text-ellipsis w-[calc(100%-20px)]"
          >
            {session.address}
          </span>
        </p>
      </div>
    </div>

    <div class="card w-96 card-bordered dark:border-slate-600">
      <div class="card-body">
        <h2 class="card-title">📷 Photo Gallery Demo</h2>
        <p>
          Try out the Webnative File System by storing your photos in public and
          private storage.
        </p>
        <div class="card-actions justify-center">
          <a class="btn btn-primary" href="/gallery">Go to Photos</a>
        </div>
      </div>
    </div>
  {/if}
  <div class="card card-bordered w-96 dark:border-slate-600">
    <div class="card-body">
      <h2 class="card-title">About</h2>
      <p>
        This app is a template for building apps with the
        <a
          class="link link-primary whitespace-nowrap"
          href="https://github.com/fission-codes/webnative"
          target="_blank"
        >
          Webnative SDK
          <span class="-scale-x-100 scale-y-100 inline-block">⎋</span>
        </a>
      </p>
      <p>
        Get started
        <a
          class="link link-primary"
          href="https://github.com/webnative-examples/walletauth"
          target="_blank"
        >
          using this template
          <span class="-scale-x-100 scale-y-100 inline-block">⎋</span>
        </a>
        and learn more in the
        <a
          class="link link-primary"
          href="https://guide.fission.codes/developers/webnative"
          target="_blank"
        >
          Webnative Guide
          <span class="-scale-x-100 scale-y-100 inline-block">⎋</span>
        </a>
      </p>
    </div>
  </div>
</div>
