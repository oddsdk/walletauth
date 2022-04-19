<script lang="ts">
  import * as webnative from "./webnative.ts";

  function onClick() {
    return webnative.login();
  }
</script>

<main class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
  <div class="text-center">
    <button
      type="button"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      on:click={onClick}>Sign in</button
    >
  </div>
</main>
