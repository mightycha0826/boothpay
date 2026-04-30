<script lang="ts">
  import BackButton from '$lib/components/BackButton.svelte';
  export let data;
  export let form;
</script>

<BackButton href="/admin" />
<h1 class="text-3xl font-bold mt-2">동아리 관리</h1>

<form method="POST" action="?/create" class="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white border-2 p-4">
  <input name="name" placeholder="이름" class="col-span-2 rounded-2xl border-2 p-4 text-lg" required />
  <input name="pin" placeholder="PIN" inputmode="numeric" maxlength="4"
    class="rounded-2xl border-2 p-4 text-lg text-center tracking-widest" required />
  <button class="col-span-3 rounded-2xl bg-slate-900 text-white py-5 text-xl font-bold active:scale-[0.98]">추가</button>
</form>
{#if form?.error}<p class="text-red-600 text-base font-semibold mt-3">{form.error}</p>{/if}

<ul class="mt-6 space-y-3">
  {#each data.clubs as c}
    <li class="rounded-2xl bg-white border-2 p-4">
      <form method="POST" action="?/update" class="grid grid-cols-3 gap-3">
        <input type="hidden" name="id" value={c.id} />
        <input name="name" value={c.name} class="col-span-2 rounded-2xl border-2 p-4 text-lg" />
        <input name="pin" value={c.pin} maxlength="4" class="rounded-2xl border-2 p-4 text-lg text-center tracking-widest" />
        <button class="col-span-2 rounded-2xl bg-slate-200 active:bg-slate-300 py-4 text-lg font-bold">저장</button>
        <button formaction="?/delete" class="rounded-2xl bg-red-600 active:bg-red-700 text-white py-4 text-lg font-bold"
          on:click={(e) => { if (!confirm('삭제하시겠습니까?')) e.preventDefault(); }}>삭제</button>
      </form>
    </li>
  {/each}
</ul>
