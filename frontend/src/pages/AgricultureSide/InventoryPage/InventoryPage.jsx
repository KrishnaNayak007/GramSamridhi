import React from 'react';
export default function InventoryPage() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(23, 54, 48, 0.08)', borderRadius: '16px', padding: '30px', minHeight: '60vh' }}>
      <h2>Waste Inventory Stock</h2>
      <p style={{ color: 'var(--ink-500)', marginTop: '10px' }}>This page shows the dynamic inventory of organic & recyclable waste stocks held at local collection yards.</p>
    </div>
  );
}