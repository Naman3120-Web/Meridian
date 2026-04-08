/**
 * Virtual Anchor
 * If you check off a specific product, we know you are exactly at that shelf.
 * This function completely resets the tracker to that coordinate, destroying any accumulated drift.
 */
export function applyVirtualAnchor(productId, catalogue) {
  const product = catalogue.find(p => p.id === productId);
  if (product && product.shelf_x && product.shelf_y) {
    return {
      x: product.shelf_x,
      y: product.shelf_y
    };
  }
  return null;
}
