<script lang="ts">
  import { initialise } from '$lib/session'
  import { sessionStore } from '../../../stores'
</script>

{#if !$sessionStore.authed}
  <button class="btn btn-sm h-10 btn-primary normal-case" on:click={initialise}>
    Connect
  </button>
{/if}
