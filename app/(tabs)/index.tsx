import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLockStore } from '@/src/store/lockStore';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const router = useRouter();

  const { config, lockState, setSimulatedLocked, accumulateUsageTime, resetDailyStatsIfNeeded } = useLockStore();
  const { getStats } = useCreationsStore();
  const creationStats = getStats();

  useEffect(() => {
    // Run midnight reset check on load
    resetDailyStatsIfNeeded();
  }, [resetDailyStatsIfNeeded]);

  const isLocked = lockState.isSimulatedLocked;

  const handleSimulateLock = () => {
    setSimulatedLocked(!isLocked);
  };

  const handleSimulateUsage = () => {
    // Add 5 minutes of usage to simulate social media scrolling
    accumulateUsageTime(5);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
            ATARAXIA
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isLocked ? 'Espacio Creativo' : 'Panel de Control'}
          </Text>
        </View>

        {/* Lock Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isLocked ? colors.primary + '15' : colors.surface,
              borderColor: isLocked ? colors.primary : colors.surfaceBorder,
            },
          ]}
        >
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconWrapper,
                { backgroundColor: isLocked ? colors.primary : colors.surfaceBorder },
              ]}
            >
              <IconSymbol
                name={isLocked ? 'lock.fill' : 'lock.open.fill'}
                size={24}
                color={isLocked ? colors.white : colors.textMuted}
              />
            </View>
            <View style={styles.statusHeaderText}>
              <Text style={[styles.statusLabel, { color: colors.textMuted }]}>ESTADO ACTUAL</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: isLocked ? colors.primary : colors.text, fontFamily: theme.typography.fontFamily.bold },
                ]}
              >
                {isLocked ? 'Bloqueo Activo' : 'Redes Libres'}
              </Text>
            </View>
          </View>

          <Text style={[styles.statusDescription, { color: colors.textMuted }]}>
            {isLocked
              ? 'Las redes sociales están desactivadas. Es el momento perfecto para escribir, grabar o dibujar algo nuevo.'
              : 'El temporizador está corriendo. Cuando alcances tu límite, entraremos en modo de enfoque y creación.'}
          </Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={handleSimulateLock}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.actionBtnText, { color: colors.white, fontFamily: theme.typography.fontFamily.semiBold }]}>
                {isLocked ? 'Desbloquear' : 'Forzar Bloqueo'}
              </Text>
            </TouchableOpacity>

            {!isLocked && (
              <TouchableOpacity
                onPress={handleSimulateUsage}
                style={[styles.actionBtnOutline, { borderColor: colors.surfaceBorder }]}
              >
                <Text style={[styles.actionBtnOutlineText, { color: colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                  Simular Uso (+5 min)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TUS PROGRESOS</Text>
        <View style={styles.statsGrid}>
          {/* Streak Card */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.statsLabel, { color: colors.textMuted }]}>RACHA ACTUAL</Text>
            <Text style={[styles.statsValueBig, { color: colors.accent, fontFamily: theme.typography.fontFamily.bold }]}>
              {lockState.streakDays} <Text style={styles.statsUnit}>días</Text>
            </Text>
            <Text style={[styles.statsSubtext, { color: colors.textMuted }]}>Días sin romper límites</Text>
          </View>

          {/* Usage Card */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.statsLabel, { color: colors.textMuted }]}>USO DIARIO</Text>
            <Text style={[styles.statsValueBig, { color: colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {lockState.accumulatedUsageMinutes}
              {config.isEnabled && config.lockType === 'time_limit' && (
                <Text style={styles.statsUnit}>/{config.timeLimitMinutes}</Text>
              )}
              <Text style={styles.statsUnit}> min</Text>
            </Text>
            <Text style={[styles.statsSubtext, { color: colors.textMuted }]}>
              {config.isEnabled
                ? config.lockType === 'time_limit'
                  ? 'Uso de redes hoy'
                  : `Bloquea a las ${config.fixedScheduleTime}`
                : 'Bloqueo desactivado'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {/* Penalties Card */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.statsLabel, { color: colors.textMuted }]}>PENALIZACIONES</Text>
            <Text style={[styles.statsValueBig, { color: lockState.penaltiesCount > 0 ? colors.danger : colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {lockState.penaltiesCount}
            </Text>
            <Text style={[styles.statsSubtext, { color: colors.textMuted }]}>Salidas durante el bloqueo</Text>
          </View>

          {/* Creations Count Card */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.statsLabel, { color: colors.textMuted }]}>OBRAS CREADAS</Text>
            <Text style={[styles.statsValueBig, { color: colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
              {creationStats.totalJournals + creationStats.totalAudios + creationStats.totalDrawings}
            </Text>
            <Text style={[styles.statsSubtext, { color: colors.textMuted }]}>Total de creaciones guardadas</Text>
          </View>
        </View>

        {/* Creative Tools Section */}
        {isLocked ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>HERRAMIENTAS DE CREACIÓN</Text>
            <View style={styles.toolsContainer}>
              {/* Journal Tool */}
              <TouchableOpacity
                onPress={() => router.push('/diario')}
                style={[styles.toolCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              >
                <View style={[styles.toolIconBg, { backgroundColor: colors.primary + '15' }]}>
                  <IconSymbol name="book.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>Escribir Diario</Text>
                  <Text style={[styles.toolDescription, { color: colors.textMuted }]}>
                    Plasma tus pensamientos libremente.
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Audio Tool */}
              <TouchableOpacity
                onPress={() => router.push('/audio')}
                style={[styles.toolCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              >
                <View style={[styles.toolIconBg, { backgroundColor: colors.accent + '15' }]}>
                  <IconSymbol name="mic.fill" size={24} color={colors.accent} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>Grabar Audio</Text>
                  <Text style={[styles.toolDescription, { color: colors.textMuted }]}>
                    Expresa lo que sientes con tu voz.
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Drawing Tool */}
              <TouchableOpacity
                onPress={() => router.push('/creations')}
                style={[styles.toolCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              >
                <View style={[styles.toolIconBg, { backgroundColor: '#F59E0B15' }]}>
                  <IconSymbol name="paintpalette.fill" size={24} color="#F59E0B" />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>Dibujar / Bocetar</Text>
                  <Text style={[styles.toolDescription, { color: colors.textMuted }]}>
                    Crea ilustraciones o esquemas rápidos.
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.unlockedNotice}>
            <Text style={[styles.unlockedNoticeText, { color: colors.textMuted }]}>
              El bloqueo no está activo. Puedes navegar por las redes sociales o activar manualmente el bloqueo arriba para forzar una sesión creativa.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 1,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statusCard: {
    marginHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeaderText: {
    marginLeft: 14,
  },
  statusLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 2,
    letterSpacing: 1,
  },
  statsLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 2,
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: theme.typography.sizes.lg,
    marginTop: 2,
  },
  statusDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionBtnText: {
    fontSize: theme.typography.sizes.sm,
  },
  actionBtnOutline: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.2,
  },
  actionBtnOutlineText: {
    fontSize: theme.typography.sizes.sm,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 1,
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  statsValueBig: {
    fontSize: theme.typography.sizes.xl,
    marginTop: 8,
    marginBottom: 4,
  },
  statsUnit: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'normal',
  },
  statsSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
  },
  toolsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    ...theme.shadows.sm,
  },
  toolIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
    marginLeft: 14,
  },
  toolTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md - 1,
  },
  toolDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs + 1,
    marginTop: 2,
  },
  unlockedNotice: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  unlockedNoticeText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
