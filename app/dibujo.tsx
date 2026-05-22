import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  PanResponder,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { DrawingPath } from '@/src/types/creations.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_HEIGHT = CANVAS_WIDTH * 1.2;

const COLORS = [
  '#1C1C1E',
  '#FFFFFF',
  '#6C63FF',
  '#FF6B6B',
  '#51CF66',
  '#339AF0',
  '#FF922B',
  '#F06595',
  '#845EF7',
  '#20C997',
];

const THICKNESSES = [
  { label: 'Fino', value: 2 },
  { label: 'Medio', value: 5 },
  { label: 'Grueso', value: 10 },
];

export default function DibujoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const router = useRouter();
  const { addDrawing } = useCreationsStore();

  const [title, setTitle] = useState('');
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentColor, setCurrentColor] = useState(colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E');
  const [currentThickness, setCurrentThickness] = useState(5);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = [{ x: locationX, y: locationY }];
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = [...currentPath.current, { x: locationX, y: locationY }];
        // Force re-render to show live drawing
        setPaths((prev) => [...prev]);
      },
      onPanResponderRelease: () => {
        if (currentPath.current.length > 1) {
          const newPath: DrawingPath = {
            points: [...currentPath.current],
            color: currentColor,
            thickness: currentThickness,
          };
          setPaths((prev) => [...prev, newPath]);
        }
        currentPath.current = [];
      },
    })
  ).current;

  const pointsToSvgPath = useCallback((points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, []);

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    if (paths.length === 0) return;
    Alert.alert(
      'Borrar todo',
      '¿Estás seguro de que quieres borrar todo el dibujo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: () => setPaths([]) },
      ]
    );
  };

  const handleSave = () => {
    if (paths.length === 0) {
      Alert.alert('Dibuja algo', 'Por favor realiza al menos un trazo antes de guardar.');
      return;
    }

    addDrawing({
      title: title.trim() || 'Dibujo sin título',
      paths,
    });

    Alert.alert('¡Guardado!', 'Tu dibujo ha sido guardado con éxito.', [
      { text: 'Aceptar', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dibujar</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={[styles.saveHeaderText, { color: colors.primary }]}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
      >
        {/* Title Input */}
        <View style={styles.titleContainer}>
          <TextInput
            placeholder="Nombre del dibujo..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.titleInput,
              {
                color: colors.text,
                borderColor: colors.surfaceBorder,
                fontFamily: theme.typography.fontFamily.semiBold,
              },
            ]}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Canvas */}
        <View
          style={[
            styles.canvasContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#FFFFFF',
              borderColor: colors.surfaceBorder,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            {/* Saved paths */}
            {paths.map((path, index) => (
              <SvgPath
                key={`path-${index}`}
                d={pointsToSvgPath(path.points)}
                stroke={path.color}
                strokeWidth={path.thickness}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {/* Current live path */}
            {currentPath.current.length > 1 && (
              <SvgPath
                d={pointsToSvgPath(currentPath.current)}
                stroke={currentColor}
                strokeWidth={currentThickness}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>

        {/* Toolbar */}
        <View style={[styles.toolbar, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Color Palette */}
          <View style={styles.toolbarSection}>
            <Text style={[styles.toolbarLabel, { color: colors.textMuted }]}>COLOR</Text>
            <View style={styles.colorRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setCurrentColor(color)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    color === '#FFFFFF' && { borderWidth: 1, borderColor: '#ccc' },
                    currentColor === color && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Thickness */}
          <View style={styles.toolbarSection}>
            <Text style={[styles.toolbarLabel, { color: colors.textMuted }]}>GROSOR</Text>
            <View style={styles.thicknessRow}>
              {THICKNESSES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setCurrentThickness(t.value)}
                  style={[
                    styles.thicknessBtn,
                    {
                      borderColor: currentThickness === t.value ? colors.primary : colors.surfaceBorder,
                      backgroundColor: currentThickness === t.value ? colors.primary + '15' : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.thicknessPreview,
                      {
                        height: t.value,
                        backgroundColor: currentColor,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.thicknessLabel,
                      {
                        color: currentThickness === t.value ? colors.primary : colors.textMuted,
                        fontFamily: theme.typography.fontFamily.medium,
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.toolbarActions}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={paths.length === 0}
              style={[
                styles.toolbarActionBtn,
                {
                  borderColor: colors.surfaceBorder,
                  opacity: paths.length === 0 ? 0.4 : 1,
                },
              ]}
            >
              <IconSymbol name="arrow.uturn.backward" size={20} color={colors.text} />
              <Text
                style={[
                  styles.toolbarActionText,
                  { color: colors.text, fontFamily: theme.typography.fontFamily.medium },
                ]}
              >
                Deshacer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearAll}
              disabled={paths.length === 0}
              style={[
                styles.toolbarActionBtn,
                {
                  borderColor: colors.surfaceBorder,
                  opacity: paths.length === 0 ? 0.4 : 1,
                },
              ]}
            >
              <IconSymbol name="trash.fill" size={20} color={colors.danger} />
              <Text
                style={[
                  styles.toolbarActionText,
                  { color: colors.danger, fontFamily: theme.typography.fontFamily.medium },
                ]}
              >
                Borrar todo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={paths.length === 0}
          style={[
            styles.saveButton,
            { backgroundColor: paths.length === 0 ? colors.surfaceBorder : colors.primary },
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: colors.white, fontFamily: theme.typography.fontFamily.bold },
            ]}
          >
            Guardar Dibujo
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 6,
    width: 70,
  },
  backText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.md - 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  saveHeaderButton: {
    paddingVertical: 6,
    width: 70,
    alignItems: 'flex-end',
  },
  saveHeaderText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md - 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleInput: {
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    width: '100%',
  },
  canvasContainer: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  toolbar: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  toolbarSection: {
    marginBottom: 14,
  },
  toolbarLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 2,
    letterSpacing: 1,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#6C63FF',
    transform: [{ scale: 1.15 }],
  },
  thicknessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  thicknessBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  thicknessPreview: {
    width: '50%',
    borderRadius: 4,
  },
  thicknessLabel: {
    fontSize: theme.typography.sizes.xs,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  toolbarActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
  },
  toolbarActionText: {
    fontSize: theme.typography.sizes.sm,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.md,
  },
});
