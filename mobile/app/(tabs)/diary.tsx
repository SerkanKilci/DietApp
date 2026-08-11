import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { foodApi } from '@/api/foodApi';
import { FoodListItemDto, FoodSource } from '@/api/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 30;

export default function DiaryScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const sourceLabels: Record<FoodSource, string> = {
    Usda: t('diary.sourceUsda'),
    OpenFoodFacts: t('diary.sourceOff'),
    UserCreated: t('diary.sourceUserCreated'),
  };

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
          {sourceLabels[item.source]}
        </Text>
      </View>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.caloriesPer100g} kcal</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}> /100g</Text>
    </Pressable>
  );

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{t('diary.title')}</Text>
        <Pressable
          onPress={() => router.push('/food/create')}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
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
          placeholder={t('diary.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, color: colors.textPrimary }}
        />
      </View>

      {totalCount > 0 && (
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: spacing.sm }}>
          {t('diary.resultsCount', { count: totalCount, formattedCount: totalCount.toLocaleString(i18n.language) })}
        </Text>
      )}

      {searchQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : searchQuery.isError ? (
        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}>
            {t('common.genericError')}
          </Text>
          <Pressable
            onPress={() => searchQuery.refetch()}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t('common.retry')}</Text>
          </Pressable>
        </View>
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
              {t('diary.noResults')}
            </Text>
          }
        />
      )}
    </Screen>
  );
}
