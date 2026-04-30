-- BoothPay schema
create extension if not exists "pgcrypto";

create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pin text not null check (pin ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  price int not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_club_idx on products(club_id);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete restrict,
  student_id text not null check (student_id ~ '^[0-9]{5}$'),
  total_price int not null check (total_price >= 0),
  created_at timestamptz not null default now()
);
create index if not exists orders_club_idx on orders(club_id);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price int not null check (unit_price >= 0)
);
create index if not exists order_items_order_idx on order_items(order_id);

-- RPC: atomic checkout. Validates PIN, decrements stock, inserts order + items.
create or replace function checkout(
  p_club_id uuid,
  p_pin text,
  p_student_id text,
  p_items jsonb -- [{product_id, quantity}]
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_total int := 0;
  v_item jsonb;
  v_product products%rowtype;
  v_qty int;
begin
  if not exists (select 1 from clubs where id = p_club_id and pin = p_pin) then
    raise exception 'invalid_pin';
  end if;
  if p_student_id !~ '^[0-9]{5}$' then
    raise exception 'invalid_student_id';
  end if;

  insert into orders(club_id, student_id, total_price) values (p_club_id, p_student_id, 0)
    returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and club_id = p_club_id
      for update;
    if not found then raise exception 'product_not_found'; end if;
    if v_product.stock < v_qty then raise exception 'insufficient_stock:%', v_product.name; end if;

    update products set stock = stock - v_qty where id = v_product.id;
    insert into order_items(order_id, product_id, quantity, unit_price)
      values (v_order_id, v_product.id, v_qty, v_product.price);
    v_total := v_total + v_product.price * v_qty;
  end loop;

  update orders set total_price = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- RLS
alter table clubs enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read for clubs (need names for login dropdown) but never PIN
-- Use a view that omits the pin
create or replace view public_clubs as select id, name from clubs;

-- Anon may read visible products
create policy "products_anon_read" on products for select
  using (is_visible = true);

-- All writes require service role (admin) or via the checkout RPC (security definer)
-- No anon insert/update/delete policies are created → blocked by default.
