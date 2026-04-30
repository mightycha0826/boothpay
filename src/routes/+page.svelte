<script lang="ts">
  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/BackButton.svelte';
</script>

<BackButton />
<div class="space-y-6">
  <header class="pt-6">
    <h1 class="text-3xl font-bold">BoothPay</h1>
    <p class="text-slate-600 mt-1">학교 축제 부스 판매 관리 시스템</p>
  </header>

  <div class="grid gap-4">
    <button class="rounded-3xl bg-slate-900 text-white py-10 text-3xl font-bold shadow-lg active:scale-[0.98]"
      on:click={() => goto('/sales')}>판매 시작 (부스)</button>
    <button class="rounded-3xl bg-white border-2 border-slate-300 py-10 text-3xl font-bold active:scale-[0.98]"
      on:click={() => goto('/admin')}>관리자 대시보드</button>
  </div>
</div>
