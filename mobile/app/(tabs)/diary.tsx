import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { foodApi } from '@/api/foodApi';
import { FoodListItemDto, FoodSource } from '@/api/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const SOURCE_LABELS: Record<FoodSource, string> = {
  Usda: 'USDA',
  OpenFoodFacts: 'Open Food Facts',
  UserCreated: 'Kendi yemeğim',
};

const PAGE_SIZE = 30;

export default function DiaryScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const searchQuery = useInfiniteQuery({
    queryKey: ['foods', 'search', debouncedQuery],
    queryFn: ({ pageParam }) => foodApi.search(debouncedQuery, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.page * lastPage.pageSize;
      return loadedCount < lastPage.totalCount ? lastPage.page + 1 : undefined;
    },
  });

  const items = useMemo(() => searchQuery.data?.pages.flatMap((page) => page.items) ?? [], [searchQuery.data]);
  const totalCount = searchQuery.data?.pages[0]?.totalCount ?? 0;

  const renderItem = ({ item }: { item: FoodListItemDto }) => (
    <Pressable
      onPress={() => router.push(`/food/${item.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
          {item.brand ? `${item.brand} · ` : ''}
          {SOURCE_LABELS[item.source]}
        </Text>
      </View>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.caloriesPer100g} kcal</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}> /100g</Text>
    </Pressable>
  );

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Besinler</Text>
        <Pressable
          onPress={() => router.push('/food/create')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.md,
          marginBottom: spacing.xs,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: spacing.sm,
          backgroundColor: colors.surface,
        }}
      >
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Besin ara... (örn. chicken, elma, nutella)"
          placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, color: colors.textPrimary }}
        />
      </View>

      {totalCount > 0 && (
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: spacing.sm }}>
          {totalCount.toLocaleString('tr-TR')} sonuç
        </Text>
      )}

      {searchQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
              searchQuery.fetchNextPage();
            }
          }}
          ListFooterComponent={
            searchQuery.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
            ) : null
          }
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }}>
              Sonuç bulunamadı. Sağ üstteki + ile kendi yemeğini ekleyebilirsin.
            </Text>
          }
        />
      )}
    </Screen>
  );
}
