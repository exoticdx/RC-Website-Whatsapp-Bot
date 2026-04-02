import type { CartItem } from "../hooks/useCart";

export function generateWhatsAppLink(cart: CartItem[], operationsNumber: string) {
  const header = "Hello! I'd like to place an order for the following items:\n\n";
  const itemsList = cart.map(item => `- SKU: ${item.sku} | Name: ${item.name} | Qty: ${item.quantity}`).join('\n');
  const footer = `\n\nTotal Items: ${cart.reduce((acc, i) => acc + i.quantity, 0)}`;
  
  const text = encodeURIComponent(header + itemsList + footer);
  return `https://wa.me/${operationsNumber}?text=${text}`;
}

export function generateCollectionRequestLink(collectionId: string, operationsNumber: string) {
  const text = encodeURIComponent(`REQUEST_COLLECTION_${collectionId}`);
  return `https://wa.me/${operationsNumber}?text=${text}`;
}
