<script lang="ts">
  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/BackButton.svelte';
  let password = '';
  let err = '';

  async function submit() {
    err = '';
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) goto('/admin');
    else err = '비밀번호가 올바르지 않습니다.';
  }
</script>

<BackButton href="/" />
<section class="space-y-5 pt-6">
  <h1 class="text-3xl font-bold">관리자 로그인</h1>
  <input type="password" bind:value={password} placeholder="관리자 비밀번호"
    class="w-full rounded-2xl border-2 border-slate-300 p-5 text-2xl" />
  {#if err}<p class="text-red-600 text-base font-semibold">{err}</p>{/if}
  <button on:click={submit} class="w-full rounded-3xl bg-slate-900 text-white py-6 text-2xl font-bold active:scale-[0.98]">
    로그인
  </button>
</section>
