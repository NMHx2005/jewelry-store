import { create } from 'zustand';

const initialItems =
  typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cartItems') || '[]') : [];

const persist = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }
};

const useCartStore = create((set, get) => ({
  items: initialItems,
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id && i.variant === item.variant);
    let next;
    if (existing) {
      next = get().items.map((i) =>
        i.id === item.id && i.variant === item.variant
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i,
      );
    } else {
      next = [...get().items, { ...item, quantity: item.quantity || 1 }];
    }
    persist(next);
    set({ items: next });
  },
  updateQuantity: (id, variant, quantity) => {
    let next = get().items.map((i) =>
      i.id === id && i.variant === variant ? { ...i, quantity } : i,
    );
    next = next.filter((i) => i.quantity > 0);
    persist(next);
    set({ items: next });
  },
  removeItem: (id, variant) => {
    const next = get().items.filter(
      (i) => !(i.id === id && (variant ? i.variant === variant : true)),
    );
    persist(next);
    set({ items: next });
  },
  clearCart: () => {
    persist([]);
    set({ items: [] });
  },
}));

export default useCartStore;


