<script lang="ts">
  import BackButton from '$lib/components/BackButton.svelte';
  export let data;
  export let form;
</script>

<BackButton href="/admin" />
<h1 class="text-3xl font-bold mt-2">상품 관리</h1>

<form method="POST" action="?/create" class="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white border-2 p-4">
  <select name="club_id" class="col-span-2 rounded-2xl border-2 p-4 text-lg" required>
    <option value="">동아리 선택</option>
    {#each data.clubs as c}<option value={c.id}>{c.name}</option>{/each}
  </select>
  <input name="name" placeholder="상품명" class="col-span-2 rounded-2xl border-2 p-4 text-lg" required />
  <input name="price" type="number" min="0" placeholder="가격" class="rounded-2xl border-2 p-4 text-lg" required />
  <input name="stock" type="number" min="0" placeholder="재고" class="rounded-2xl border-2 p-4 text-lg" required />
  <label class="col-span-2 flex items-center gap-3 text-lg p-2">
    <input type="checkbox" name="is_visible" checked class="size-6" /> 판매중 표시
  </label>
  <button class="col-span-2 rounded-2xl bg-slate-900 text-white py-5 text-xl font-bold active:scale-[0.98]">추가</button>
</form>
{#if form?.error}<p class="text-red-600 text-base font-semibold mt-3">{form.error}</p>{/if}

<ul class="mt-6 space-y-3">
  {#each data.products as p}
    <li class="rounded-2xl bg-white border-2 p-4">
      <form method="POST" action="?/update" class="grid grid-cols-4 gap-3">
        <input type="hidden" name="id" value={p.id} />
        <select name="club_id" class="col-span-4 rounded-2xl border-2 p-4 text-lg">
          {#each data.clubs as c}
            <option value={c.id} selected={c.id === p.club_id}>{c.name}</option>
          {/each}
        </select>
        <input name="name" value={p.name} class="col-span-4 rounded-2xl border-2 p-4 text-lg" />
        <input name="price" type="number" value={p.price} class="col-span-2 rounded-2xl border-2 p-4 text-lg" />
        <input name="stock" type="number" value={p.stock} class="col-span-2 rounded-2xl border-2 p-4 text-lg" />
        <label class="col-span-4 flex items-center gap-3 text-lg p-2">
          <input type="checkbox" name="is_visible" checked={p.is_visible} class="size-6" /> 판매중 표시
        </label>
        <button class="col-span-3 rounded-2xl bg-slate-200 active:bg-slate-300 py-4 text-lg font-bold">저장</button>
        <button formaction="?/delete" class="rounded-2xl bg-red-600 active:bg-red-700 text-white py-4 text-lg font-bold"
          on:click={(e) => { if (!confirm('삭제?')) e.preventDefault(); }}>삭제</button>
      </form>
    </li>
  {/each}
</ul>
