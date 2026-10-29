export const healIconThresholds = [1, 4, 8, 16, 32, 64, 128,
  256, 512, 1024, 1400]

export function healIconCountFor(amount: number): number {
  return healIconThresholds.filter(threshold => amount >= threshold).length
}
