import { createElement, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { toDateOnlyString } from '@/utils/date';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate: Date;
  maximumDate: Date;
}

// @react-native-community/datetimepicker'ın web taşıması yok (saf native modül) — web'de
// tarayıcının kendi <input type="date"> öğesine düşüyoruz, native'de paketin kendi UI'ını kullanıyoruz.
export function DateField({ value, onChange, minimumDate, maximumDate }: DateFieldProps) {
  const { colors, spacing, isDark } = useTheme();
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: value ? toDateOnlyString(value) : '',
      min: toDateOnlyString(minimumDate),
      max: toDateOnlyString(maximumDate),
      onChange: (e: { target: { value: string } }) => {
        const raw = e.target.value;
        if (!raw) return;
        const [y, m, d] = raw.split('-').map(Number);
        onChange(new Date(y, m - 1, d));
      },
      style: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: spacing.sm + 2,
        fontSize: 16,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        // colorScheme olmadan tarayıcı takvim ikonunu her zaman koyu (siyah) çiziyor —
        // dark modda koyu arka plan üzerinde görünmez oluyordu.
        colorScheme: isDark ? 'dark' : 'light',
      },
    });
  }

  return (
    <View>
      {Platform.OS === 'android' && (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ color: value ? colors.textPrimary : colors.textSecondary, fontSize: 16 }}>
            {value ? toDateOnlyString(value) : t('common.selectDate')}
          </Text>
        </Pressable>
      )}
      {showPicker && (
        <DateTimePicker
          value={value ?? maximumDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, date) => {
            if (Platform.OS === 'android') {
              setShowPicker(false);
            }
            if (date) {
              onChange(date);
            }
          }}
        />
      )}
    </View>
  );
}
