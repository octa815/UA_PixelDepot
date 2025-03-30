// src/components/Assets/AssetList.js
import React from 'react';
import AssetCard from './AssetCard';
import styles from './AssetList.module.css';

function AssetList({ assets }) {
  if (!assets || assets.length === 0) {
    return <p className={styles.noAssets}>No se encontraron assets.</p>;
  }

  return (
    <div className={styles.list}>
      {assets.map((asset) => (
        <AssetCard key={asset?._id || Math.random()} asset={asset} /> // Usa ID real o fallback
      ))}
    </div>
  );
}

export default AssetList;