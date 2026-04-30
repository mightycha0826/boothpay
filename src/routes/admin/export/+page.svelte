<script lang="ts">
  import * as XLSX from 'xlsx';
  import BackButton from '$lib/components/BackButton.svelte';
  export let data;
  let clubId = '';
  let busy = false;
  let msg = '';

  async function download(scope: 'all' | 'club') {
    busy = true; msg = '';
    try {
      const qs = scope === 'club' && clubId ? `?clubId=${clubId}` : '';
      const res = await fetch('/api/admin/sales' + qs);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'failed');
      const rows = json.rows as any[];
      if (rows.length === 0) { msg = '데이터가 없습니다.'; return; }

      const ws = XLSX.utils.json_to_sheet(rows, {
        header: ['Timestamp', 'Club Name', 'Student ID', 'Product Name', 'Unit Price', 'Quantity', 'Subtotal']
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
      const label = scope === 'club'
        ? data.clubs.find((c) => c.id === clubId)?.name ?? 'club'
        : 'all';
      XLSX.writeFile(wb, `boothpay_sales_${label}_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (e: any) {
      msg = e.message;
    } finally { busy = false; }
  }
</script>

<BackButton href="/admin" />
<h1 class="text-3xl font-bold mt-2">엑셀 내보내기</h1>

<div class="mt-6 space-y-5">
  <button class="w-full rounded-3xl bg-slate-900 text-white py-6 text-2xl font-bold disabled:bg-slate-300 active:scale-[0.98]"
    disabled={busy} on:click={() => download('all')}>전체 매출 다운로드</button>

  <div class="rounded-2xl bg-white border-2 p-5 space-y-4">
    <select bind:value={clubId} class="w-full rounded-2xl border-2 p-4 text-lg">
      <option value="">동아리 선택</option>
      {#each data.clubs as c}<option value={c.id}>{c.name}</option>{/each}
    </select>
    <button class="w-full rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white py-5 text-xl font-bold disabled:bg-slate-300 active:scale-[0.98]"
      disabled={busy || !clubId} on:click={() => download('club')}>선택 동아리 다운로드</button>
  </div>

  {#if msg}<p class="text-lg text-slate-600 font-semibold">{msg}</p>{/if}
</div>
