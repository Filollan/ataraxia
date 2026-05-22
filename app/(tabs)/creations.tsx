import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type FilterType = 'all' | 'journal' | 'audio' | 'drawing';

export default function CreationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { journals, audios, drawings, deleteJournal, deleteAudio, deleteDrawing } =
    useCreationsStore();

  // Combine and sort all creations by date descending
  const allCreations = [
    ...journals.map((j) => ({ ...j, type: 'journal' as const })),
    ...audios.map((a) => ({ ...a, type: 'audio' as const })),
    ...drawings.map((d) => ({ ...d, type: 'drawing' as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredData = allCreations.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Cleanup audio timer on unmount
  useEffect(() => {
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAudioPlayback = (audioId: string, durationMs: number) => {
    if (playingAudioId === audioId) {
      // Stop
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
      setPlayingAudioId(null);
      setAudioProgress(0);
    } else {
      // Stop previous
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);

      // Start new
      setPlayingAudioId(audioId);
      setAudioProgress(0);
      const totalSteps = Math.max(durationMs / 100, 1);
      let step = 0;
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
        step++;
        const progress = Math.min(step / totalSteps, 1);
        setAudioProgress(progress);
        if (progress >= 1) {
          if (audioTimerRef.current) clearInterval(audioTimerRef.current);
          audioTimerRef.current = null;
          setPlayingAudioId(null);
          setAudioProgress(0);
        }
      }, 100);
    }
  };

  const toggleFabMenu = () => {
    if (showFabMenu) {
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowFabMenu(false));
    } else {
      setShowFabMenu(true);
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleFabAction = (route: string) => {
    toggleFabMenu();
    router.push(route as any);
  };

  const pointsToSvgPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const renderCreationItem = ({
    item,
  }: {
    item: (typeof allCreations)[0];
  }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let iconName: 'book.fill' | 'mic.fill' | 'paintpalette.fill' = 'book.fill';
    let typeLabel = 'Escrito';
    let iconBg = colors.primary + '20';
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

    const isExpanded = expandedItems.has(item.id);
    const isPlaying = playingAudioId === item.id;

    const handleDelete = () => {
      if (item.type === 'journal') deleteJournal(item.id);
      else if (item.type === 'audio') {
        if (isPlaying) {
          if (audioTimerRef.current) clearInterval(audioTimerRef.current);
          setPlayingAudioId(null);
          setAudioProgress(0);
        }
        deleteAudio(item.id);
      } else if (item.type === 'drawing') deleteDrawing(item.id);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (item.type === 'journal' || item.type === 'drawing') {
            toggleExpand(item.id);
          }
        }}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
            <IconSymbol name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.typeLabel, { color: iconColor }]}>
              {typeLabel}
            </Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {dateStr}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <IconSymbol name="trash.fill" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title || 'Creación sin título'}
          </Text>

          {/* Journal content - expandable */}
          {item.type === 'journal' && 'content' in item && (
            <View>
              <Text
                numberOfLines={isExpanded ? undefined : 3}
                style={[styles.snippet, { color: colors.textMuted }]}
              >
                {item.content}
              </Text>
              {'mood' in item && item.mood && (
                <View style={[styles.moodBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.moodBadgeText, { color: colors.primary }]}>
                    {item.mood}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={styles.expandBtn}
              >
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.expandText,
                    { color: colors.primary, fontFamily: theme.typography.fontFamily.semiBold },
                  ]}
                >
                  {isExpanded ? 'Ver menos' : 'Leer completo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Audio - mini player */}
          {item.type === 'audio' && 'durationMs' in item && (
            <View style={styles.audioPlayer}>
              <TouchableOpacity
                onPress={() => toggleAudioPlayback(item.id, item.durationMs)}
                style={[styles.playButton, { backgroundColor: colors.accent }]}
              >
                <IconSymbol
                  name={isPlaying ? 'pause.fill' : 'play.fill'}
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>

              <View style={styles.audioInfo}>
                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: colors.surfaceBorder },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.accent,
                        width: isPlaying ? `${audioProgress * 100}%` : '0%',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.audioDuration,
                    { color: colors.textMuted, fontFamily: theme.typography.fontFamily.medium },
                  ]}
                >
                  {isPlaying
                    ? `${Math.floor((audioProgress * item.durationMs) / 1000)}s`
                    : `${Math.round(item.durationMs / 1000)}s`}
                  {' / '}
                  {Math.round(item.durationMs / 1000)}s
                </Text>
              </View>
            </View>
          )}

          {/* Drawing - SVG preview */}
          {item.type === 'drawing' && 'paths' in item && (
            <View>
              <View
                style={[
                  styles.drawingPreview,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#FAFAFA',
                    borderColor: colors.surfaceBorder,
                  },
                ]}
              >
                <Svg width="100%" height={isExpanded ? 200 : 120} viewBox="0 0 350 400">
                  {item.paths.map((path, index) => (
                    <SvgPath
                      key={`preview-${item.id}-${index}`}
                      d={pointsToSvgPath(path.points)}
                      stroke={path.color}
                      strokeWidth={path.thickness}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </Svg>
              </View>
              <Text style={[styles.snippet, { color: colors.textMuted, marginTop: 6 }]}>
                {item.paths.length} trazo{item.paths.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={styles.expandBtn}
              >
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color={'#F59E0B'}
                />
                <Text
                  style={[
                    styles.expandText,
                    { color: '#F59E0B', fontFamily: theme.typography.fontFamily.semiBold },
                  ]}
                >
                  {isExpanded ? 'Reducir' : 'Ver más grande'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'journal', label: 'Escritos' },
    { value: 'audio', label: 'Audios' },
    { value: 'drawing', label: 'Dibujos' },
  ];

  const fabMenuItems = [
    { icon: 'book.fill' as const, label: 'Nuevo Escrito', route: '/diario', color: colors.primary },
    { icon: 'mic.fill' as const, label: 'Nueva Grabación', route: '/audio', color: colors.accent },
    { icon: 'paintpalette.fill' as const, label: 'Nuevo Dibujo', route: '/dibujo', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mis Creaciones
        </Text>
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
                !isActive && {
                  borderColor: colors.surfaceBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { fontFamily: theme.typography.fontFamily.semiBold },
                  isActive
                    ? { color: colors.white }
                    : { color: colors.textMuted },
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
            <View
              style={[
                styles.emptyIconWrapper,
                { backgroundColor: colors.surface },
              ]}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={48}
                color={colors.textMuted}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No hay creaciones aún
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Toca el botón + abajo para crear un escrito, grabar un audio o
              hacer un dibujo.
            </Text>
          </View>
        }
      />

      {/* FAB Menu Overlay */}
      {showFabMenu && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleFabMenu}
          style={styles.fabOverlay}
        >
          <View style={styles.fabMenuContainer}>
            {fabMenuItems.map((item, index) => {
              const translateY = fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              });
              const opacity = fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });
              return (
                <Animated.View
                  key={item.route}
                  style={[
                    styles.fabMenuItem,
                    {
                      transform: [{ translateY }],
                      opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleFabAction(item.route)}
                    style={[styles.fabMenuBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                  >
                    <View style={[styles.fabMenuIcon, { backgroundColor: item.color + '20' }]}>
                      <IconSymbol name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text
                      style={[
                        styles.fabMenuLabel,
                        { color: colors.text, fontFamily: theme.typography.fontFamily.semiBold },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </TouchableOpacity>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        onPress={toggleFabMenu}
        style={[
          styles.fab,
          {
            backgroundColor: showFabMenu ? colors.text : colors.primary,
            ...theme.shadows.lg,
          },
        ]}
      >
        <IconSymbol
          name={showFabMenu ? 'xmark' : 'plus'}
          size={28}
          color={colors.white}
        />
      </TouchableOpacity>
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
    paddingBottom: 100,
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
    paddingVertical: 6,
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
    lineHeight: 20,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 8,
  },
  moodBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: theme.typography.sizes.xs + 1,
  },
  // Audio player
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  audioDuration: {
    fontSize: theme.typography.sizes.xs,
  },
  // Drawing preview
  drawingPreview: {
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  // Empty state
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
  // FAB
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 90,
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 180 : 150,
    right: 20,
    gap: 10,
  },
  fabMenuItem: {},
  fabMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    gap: 12,
    ...theme.shadows.md,
  },
  fabMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuLabel: {
    fontSize: theme.typography.sizes.sm + 1,
  },
});
