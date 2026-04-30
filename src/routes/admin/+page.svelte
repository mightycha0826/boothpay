<script lang="ts">
  import BackButton from '$lib/components/BackButton.svelte';
  export let data;
</script>

<BackButton href="/" />
<h1 class="text-3xl font-bold pt-2">관리자 대시보드</h1>

<nav class="grid grid-cols-3 gap-3 mt-5">
  <a href="/admin/clubs"
    class="rounded-2xl bg-white border-2 border-slate-300 py-5 text-center text-xl font-bold active:bg-slate-100">동아리</a>
  <a href="/admin/products"
    class="rounded-2xl bg-white border-2 border-slate-300 py-5 text-center text-xl font-bold active:bg-slate-100">상품</a>
  <a href="/admin/export"
    class="rounded-2xl bg-white border-2 border-slate-300 py-5 text-center text-xl font-bold active:bg-slate-100">엑셀</a>
</nav>

<section class="mt-6 grid grid-cols-2 gap-4">
  <div class="rounded-2xl bg-white border-2 p-5">
    <div class="text-base text-slate-500">총 매출</div>
    <div class="text-3xl font-bold mt-1">{data.total.toLocaleString()}원</div>
  </div>
  <div class="rounded-2xl bg-white border-2 p-5">
    <div class="text-base text-slate-500">총 주문</div>
    <div class="text-3xl font-bold mt-1">{data.orderCount}</div>
  </div>
</section>

<section class="mt-6">
  <h2 class="text-xl font-bold mb-3">동아리별 매출</h2>
  <ul class="rounded-2xl bg-white border-2 divide-y">
    {#each data.breakdown as c}
      <li class="flex justify-between items-center p-5 text-lg">
        <span class="font-semibold">{c.name}</span>
        <span class="font-bold text-xl">{c.revenue.toLocaleString()}원</span>
      </li>
    {:else}
      <li class="p-5 text-slate-500 text-lg">등록된 동아리가 없습니다.</li>
    {/each}
  </ul>
</section>
