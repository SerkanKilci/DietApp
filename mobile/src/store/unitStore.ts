import { create } from 'zustand';
import * as Localization from 'expo-localization';

export type UnitSystem = 'metric' | 'imperial';

// ABD ve birkaç ülke (Liberya, Myanmar) resmi olarak metrik değil, ft/lb kullanır.
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM']);

function detectDefaultUnitSystem(): UnitSystem {
  const region = Localization.getLocales()[0]?.regionCode;
  return region && IMPERIAL_REGIONS.has(region) ? 'imperial' : 'metric';
}

interface UnitState {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
}

export const useUnitStore = create<UnitState>((set) => ({
  system: detectDefaultUnitSystem(),
  setSystem: (system) => set({ system }),
}));
