<script lang="ts">
  import { goto } from '$app/navigation';
  export let href: string | null = null;

  function back() {
    if (href) goto(href);
    else if (typeof history !== 'undefined' && history.length > 1) history.back();
    else goto('/');
  }
</script>

<button type="button" on:click={back}
  class="inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 active:bg-slate-300 rounded-2xl px-5 py-4 mb-4">
  <span aria-hidden="true">←</span> 뒤로가기
</button>
