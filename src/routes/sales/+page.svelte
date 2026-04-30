<script lang="ts">
  import { onMount } from 'svelte';
  import type { Product } from '$lib/supabaseClient';
  import { session, logout } from '$lib/stores/session';
  import { cart, cartTotal, cartCount } from '$lib/stores/cart';
  import BackButton from '$lib/components/BackButton.svelte';

  let clubs: { id: string; name: string }[] = [];
  let selectedClubId = '';
  let pin = '';
  let loginError = '';

  let products: Product[] = [];
  let studentId = '';
  let submitting = false;
  let toast = '';

  onMount(async () => {
    const res = await fetch('/api/clubs');
    const json = await res.json();
    clubs = json.clubs ?? [];
    if ($session) await loadProducts($session.clubId);
  });

  async function loadProducts(clubId: string) {
    const res = await fetch(`/api/products?clubId=${clubId}`);
    const json = await res.json();
    products = json.products ?? [];
  }

  async function login() {
    loginError = '';
    if (!selectedClubId) return (loginError = '동아리를 선택하세요.');
    if (!/^[0-9]{4}$/.test(pin)) return (loginError = 'PIN은 4자리 숫자입니다.');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: selectedClubId, pin })
    });
    const json = await res.json();
    if (!res.ok) return (loginError = json.error ?? '로그인 실패');

    const club = clubs.find((c) => c.id === selectedClubId)!;
    session.set({ clubId: club.id, clubName: club.name, pin });
    await loadProducts(club.id);
    pin = '';
  }

  async function checkout() {
    if (!$session) return;
    if (!/^[0-9]{5}$/.test(studentId)) return showToast('학번은 5자리 숫자입니다.');
    if ($cartCount === 0) return showToast('장바구니가 비어 있습니다.');

    submitting = true;
    try {
      const items = Array.from($cart.values()).map((l) => ({
        product_id: l.product.id, quantity: l.qty
      }));
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: $session.clubId, pin: $session.pin, studentId, items
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.error || `결제 실패 (${res.status})`);
      cart.clear();
      studentId = '';
      showToast('결제 완료 ✓');
      await loadProducts($session.clubId);
    } catch (e: any) {
      showToast(e.message);
    } finally {
      submitting = false;
    }
  }

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => (toast = ''), 2000);
  }

  function qtyOf(id: string) { return $cart.get(id)?.qty ?? 0; }
</script>

<BackButton href="/" />
{#if !$session}
  <section class="space-y-5 pt-6">
    <h1 class="text-3xl font-bold">부스 로그인</h1>
    <label class="block">
      <span class="text-base text-slate-600">동아리</span>
      <select bind:value={selectedClubId}
        class="mt-2 w-full rounded-2xl border-2 border-slate-300 p-5 text-2xl">
        <option value="">선택하세요</option>
        {#each clubs as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </label>
    <label class="block">
      <span class="text-base text-slate-600">PIN (4자리)</span>
      <input type="password" inputmode="numeric" maxlength="4" bind:value={pin}
        class="mt-2 w-full rounded-2xl border-2 border-slate-300 p-5 text-3xl tracking-widest text-center" />
    </label>
    {#if loginError}<p class="text-red-600 text-base font-semibold">{loginError}</p>{/if}
    <button on:click={login} class="w-full rounded-3xl bg-slate-900 text-white py-6 text-2xl font-bold active:scale-[0.98]">
      로그인
    </button>
  </section>
{:else}
  <section class="space-y-4">
    <div class="flex items-center justify-between pt-2">
      <div>
        <h1 class="text-2xl font-bold">{$session.clubName}</h1>
        <p class="text-sm text-slate-500">판매 모드</p>
      </div>
      <button class="rounded-2xl bg-slate-200 active:bg-slate-300 px-5 py-3 text-base font-semibold"
        on:click={logout}>로그아웃</button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      {#each products as p}
        {@const q = qtyOf(p.id)}
        <div class="rounded-2xl bg-white border-2 border-slate-200 p-5 shadow-sm flex flex-col">
          <div class="flex-1">
            <div class="font-bold text-2xl">{p.name}</div>
            <div class="text-slate-700 text-xl mt-1">{p.price.toLocaleString()}원</div>
            <div class="text-sm text-slate-400 mt-1">재고 {p.stock}</div>
          </div>
          {#if q === 0}
            <button class="mt-4 rounded-2xl bg-slate-900 text-white py-5 text-xl font-bold disabled:bg-slate-300 active:scale-[0.98]"
              disabled={p.stock === 0} on:click={() => cart.add(p)}>담기</button>
          {:else}
            <div class="mt-4 flex items-center justify-between gap-2">
              <button class="size-16 rounded-2xl bg-slate-200 active:bg-slate-300 text-4xl font-bold"
                on:click={() => cart.dec(p.id)}>−</button>
              <span class="text-3xl font-bold">{q}</span>
              <button class="size-16 rounded-2xl bg-slate-900 text-white text-4xl font-bold disabled:bg-slate-300 active:scale-[0.95]"
                disabled={q >= p.stock} on:click={() => cart.add(p)}>+</button>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="sticky bottom-0 -mx-4 mt-6 bg-white border-t-2 border-slate-200 p-5 space-y-4 shadow-2xl">
      <div class="flex items-baseline justify-between">
        <span class="text-slate-500 text-lg">합계 ({$cartCount}개)</span>
        <span class="text-4xl font-bold">{$cartTotal.toLocaleString()}원</span>
      </div>
      <input type="tel" inputmode="numeric" maxlength="5" placeholder="학번 (5자리)"
        bind:value={studentId}
        class="w-full rounded-2xl border-2 border-slate-300 p-5 text-3xl tracking-widest text-center" />
      <div class="grid grid-cols-3 gap-3">
        <button class="col-span-1 rounded-2xl bg-slate-200 active:bg-slate-300 py-6 text-xl font-bold"
          on:click={() => cart.clear()}>비우기</button>
        <button class="col-span-2 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white py-6 text-2xl font-bold disabled:bg-slate-300 active:scale-[0.98]"
          disabled={submitting || $cartCount === 0} on:click={checkout}>
          {submitting ? '처리 중…' : '결제 완료'}
        </button>
      </div>
    </div>
  </section>
{/if}

{#if toast}
  <div class="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl text-xl font-bold">
    {toast}
  </div>
{/if}
