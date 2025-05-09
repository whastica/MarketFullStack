export const getProductImageUrl = (productId: number): string => {
  return `/api/placeholder/300/200?text=Producto ${productId}`;
};