<script lang="ts">
  import { sessionStore } from '$src/stores'

  const start_and_end = (str: string) => {
    if (str.length > 35) {
      return str.substr(0, 5) + '.....' + str.substr(str.length-4, str.length)
    }
    return str
  }
</script>

<div
  class="min-h-[calc(100vh-128px)] md:min-h-[calc(100vh-160px)] pt-8 md:pt-16 flex flex-col items-start max-w-[690px] m-auto gap-10 pb-5 text-sm"
>
  <h1 class="text-xl">Welcome, <span class="font-bold uppercase">{start_and_end($sessionStore.address)}</span>!</h1>

  <div class="flex flex-col items-start justify-center gap-5">
    <h2 class="text-lg">Photo Gallery Demo</h2>
    <p>
      The ODD SDK makes it easy to implement private, encrypted, user-owned
      storage in your app. See it in action with our photo gallery demo.
    </p>
    <a class="btn btn-primary" href="/gallery">Try the Photo Gallery Demo</a>
  </div>
</div>
