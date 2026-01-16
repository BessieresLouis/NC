const STORAGE_KEY = "ncf-items";

export const loadItems = async () => {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  const response = await fetch("data.json");
  const items = await response.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const saveItems = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getItemById = (items, id) => items.find((item) => item.id === id);

export const generateId = () => `ncf_${Date.now()}`;

export const generateNumero = (items, dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `NCF${year}-${month}-`;
  const sameMonth = items
    .map((item) => item.numero)
    .filter((numero) => numero?.startsWith(prefix));
  const maxIndex = sameMonth.reduce((max, numero) => {
    const parts = numero.split("-");
    const number = Number(parts[2]);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `${prefix}${String(maxIndex + 1).padStart(2, "0")}`;
};
