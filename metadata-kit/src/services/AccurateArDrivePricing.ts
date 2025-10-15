// ArDrive pricing service
import type { StorageCost } from '../types/index.js';

export async function calculateCost(sizeBytes: number): Promise<StorageCost> {
  // Simplified pricing calculation
  const costPerMB = 0.01; // $0.01 per MB
  const sizeMB = sizeBytes / (1024 * 1024);
  const costUSD = sizeMB * costPerMB;
  
  return {
    bytes: sizeBytes,
    costUSD,
    currency: 'USD',
    provider: 'arweave'
  };
}