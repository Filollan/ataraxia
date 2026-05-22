import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type FilterType = 'all' | 'journal' | 'audio' | 'drawing';

export default function CreationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const [filter, setFilter] = useState<FilterType>('all');

  const { journals, audios, drawings, deleteJournal, deleteAudio, deleteDrawing } = useCreationsStore();

  // Combine and sort all creations by date descending
  const allCreations = [
    ...journals.map((j) => ({ ...j, type: 'journal' as const })),
    ...audios.map((a) => ({ ...a, type: 'audio' as const })),
    ...drawings.map((d) => ({ ...d, type: 'drawing' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredData = allCreations.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const renderCreationItem = ({ item }: { item: typeof allCreations[0] }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let iconName: 'book.fill' | 'mic.fill' | 'paintpalette.fill' = 'book.fill';
    let typeLabel = 'Escrito';
    let iconBg = colors.primary + '20'; // 12% opacity
    let iconColor = colors.primary;

    if (item.type === 'audio') {
      iconName = 'mic.fill';
      typeLabel = 'Grabación';
      iconBg = colors.accent + '20';
      iconColor = colors.accent;
    } else if (item.type === 'drawing') {
      iconName = 'paintpalette.fill';
      typeLabel = 'Dibujo';
      iconBg = '#F59E0B20';
      iconColor = '#F59E0B';
    }

    const handleDelete = () => {
      if (item.type === 'journal') deleteJournal(item.id);
      else if (item.type === 'audio') deleteAudio(item.id);
      else if (item.type === 'drawing') deleteDrawing(item.id);
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
            <IconSymbol name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.typeLabel, { color: iconColor }]}>{typeLabel}</Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{dateStr}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={{ color: colors.danger, fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 }}>Borrar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title || 'Creación sin título'}</Text>
          {item.type === 'journal' && 'content' in item && (
            <Text numberOfLines={3} style={[styles.snippet, { color: colors.textMuted }]}>
              {item.content}
            </Text>
          )}
          {item.type === 'audio' && 'durationMs' in item && (
            <Text style={[styles.snippet, { color: colors.textMuted }]}>
              Duración: {Math.round(item.durationMs / 1000)}s
            </Text>
          )}
          {item.type === 'drawing' && 'paths' in item && (
            <Text style={[styles.snippet, { color: colors.textMuted }]}>
              Dibujo compuesto por {item.paths.length} trazos
            </Text>
          )}
        </View>
      </View>
    );
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'journal', label: 'Escritos' },
    { value: 'audio', label: 'Audios' },
    { value: 'drawing', label: 'Dibujos' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Creaciones</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Tu espacio libre de distracciones de redes sociales.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((f) => {
          const isActive = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterButton,
                isActive && { backgroundColor: colors.primary },
                !isActive && { borderColor: colors.surfaceBorder, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { fontFamily: theme.typography.fontFamily.semiBold },
                  isActive ? { color: colors.white } : { color: colors.textMuted },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Creations List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderCreationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: colors.surface }]}>
              <IconSymbol name="plus.circle.fill" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay creaciones aún</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Cuando bloquees las redes sociales o decidas crear, tus obras aparecerán organizadas aquí.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: theme.typography.sizes.xs + 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  typeLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    marginBottom: 6,
  },
  cardContent: {
    marginTop: 2,
  },
  snippet: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
