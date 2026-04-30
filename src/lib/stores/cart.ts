import { derived, writable } from 'svelte/store';
import type { Product } from '$lib/supabaseClient';

export type CartLine = { product: Product; qty: number };

function createCart() {
  const { subscribe, update, set } = writable<Map<string, CartLine>>(new Map());

  return {
    subscribe,
    add(product: Product) {
      update((m) => {
        const line = m.get(product.id);
        const next = (line?.qty ?? 0) + 1;
        if (next > product.stock) return m;
        m.set(product.id, { product, qty: next });
        return new Map(m);
      });
    },
    dec(productId: string) {
      update((m) => {
        const line = m.get(productId);
        if (!line) return m;
        if (line.qty <= 1) m.delete(productId);
        else m.set(productId, { ...line, qty: line.qty - 1 });
        return new Map(m);
      });
    },
    remove(productId: string) {
      update((m) => { m.delete(productId); return new Map(m); });
    },
    clear() { set(new Map()); }
  };
}

export const cart = createCart();

export const cartTotal = derived(cart, ($c) => {
  let total = 0;
  for (const { product, qty } of $c.values()) total += product.price * qty;
  return total;
});

export const cartCount = derived(cart, ($c) => {
  let n = 0;
  for (const { qty } of $c.values()) n += qty;
  return n;
});
