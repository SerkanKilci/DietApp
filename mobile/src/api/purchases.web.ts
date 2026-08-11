// Web derlemesi için no-op sürüm — react-native-purchases native bir modül olduğundan web'de
// hiç import edilmiyor bile (Metro bu dosyayı web platformu için otomatik seçer, bkz. purchases.ts).
// Abonelik durumu her zaman backend'den (subscriptionApi.getStatus) okunduğu için web modunda
// satın alma akışı sadece "bu özellik mobil cihazda kullanılabilir" mesajıyla devre dışı kalır.
export type PurchasesOffering = { availablePackages: PurchasesPackage[] };
export type PurchasesPackage = { identifier: string; product: { priceString: string; title: string } };

export function initPurchases(_userId: string): void {}

export async function logOutPurchases(): Promise<void> {}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  return null;
}

export async function purchasePackage(_pkg: PurchasesPackage): Promise<{ userCancelled: boolean; isEntitled: boolean }> {
  return { userCancelled: true, isEntitled: false };
}

export async function restorePurchases(): Promise<void> {}
