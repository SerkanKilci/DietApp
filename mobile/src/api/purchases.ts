import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

// react-native-purchases native bir modül — Expo Go'da ve web'de çalışmaz, sadece EAS dev client
// build'inde çalışır. Metro bu dosyayı sadece ios/android bundle'ları için seçer; web derlemesi
// otomatik olarak purchases.web.ts'i kullanır (bkz. o dosyadaki not) — bu yüzden burada gerçek
// react-native-purchases import'u web bundle'ına hiç girmez.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

let isConfigured = false;

export function initPurchases(userId: string): void {
  if (isConfigured) return;

  const apiKey = Platform.OS === 'ios' ? extra.revenueCatIosApiKey : extra.revenueCatAndroidApiKey;
  if (!apiKey) return;

  Purchases.configure({ apiKey, appUserID: userId });
  isConfigured = true;
}

export async function logOutPurchases(): Promise<void> {
  if (!isConfigured) return;
  await Purchases.logOut();
  isConfigured = false;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

const ENTITLEMENT_ID = 'premium';

export async function purchasePackage(pkg: PurchasesPackage): Promise<{ userCancelled: boolean; isEntitled: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { userCancelled: false, isEntitled: customerInfo.entitlements.active[ENTITLEMENT_ID] != null };
  } catch (error) {
    const purchasesError = error as { userCancelled?: boolean };
    if (purchasesError.userCancelled) {
      return { userCancelled: true, isEntitled: false };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<void> {
  await Purchases.restorePurchases();
}

export type { PurchasesOffering, PurchasesPackage };
