import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ClubSession = { clubId: string; clubName: string; pin: string } | null;

const KEY = 'boothpay.session';
const initial: ClubSession = browser
  ? (JSON.parse(localStorage.getItem(KEY) || 'null') as ClubSession)
  : null;

export const session = writable<ClubSession>(initial);

if (browser) {
  session.subscribe((v) => {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  });
}

export function logout() { session.set(null); }
