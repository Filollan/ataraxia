import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, SafeAreaView, Platform, TextInput } from 'react-native';
import { useLockStore } from '@/src/store/lockStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];

  const { config, updateConfig } = useLockStore();

  const handleToggleBlock = (app: string) => {
    const isBlocked = config.socialAppsBlocked.includes(app);
    const updatedApps = isBlocked
      ? config.socialAppsBlocked.filter((a) => a !== app)
      : [...config.socialAppsBlocked, app];
    updateConfig({ socialAppsBlocked: updatedApps });
  };

  const handleSetTimeLimit = (text: string) => {
    const mins = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    updateConfig({ timeLimitMinutes: mins });
  };

  const AVAILABLE_APPS = ['Instagram', 'TikTok', 'Facebook', 'Twitter', 'YouTube', 'Reddit', 'Pinterest'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes de Bloqueo</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Personaliza cuándo y qué aplicaciones bloquear para fomentar tu creatividad.
          </Text>
        </View>

        {/* Core Lock Activation */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Activar Bloqueo</Text>
              <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                Habilita el bloqueo simulado de redes sociales.
              </Text>
            </View>
            <Switch
              value={config.isEnabled}
              onValueChange={(val) => updateConfig({ isEnabled: val })}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
            />
          </View>
        </View>

        {config.isEnabled && (
          <>
            {/* Lock Mode Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODO DE BLOQUEO</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {/* Option 1: Time Limit */}
              <TouchableOpacity
                onPress={() => updateConfig({ lockType: 'time_limit' })}
                style={[
                  styles.optionRow,
                  styles.borderBottom,
                  { borderBottomColor: colors.surfaceBorder },
                ]}
              >
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Límite de Tiempo Diario</Text>
                  <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                    Bloquea tras usar las redes sociales cierto tiempo al día.
                  </Text>
                </View>
                {config.lockType === 'time_limit' && (
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Option 2: Fixed Schedule */}
              <TouchableOpacity
                onPress={() => updateConfig({ lockType: 'fixed_schedule' })}
                style={styles.optionRow}
              >
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Hora Fija del Día</Text>
                  <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                    Bloquea automáticamente a una hora predeterminada todos los días.
                  </Text>
                </View>
                {config.lockType === 'fixed_schedule' && (
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Lock Mode Configuration Values */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONFIGURAR LÍMITES</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {config.lockType === 'time_limit' ? (
                <View style={styles.settingInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>Tiempo Límite Diario</Text>
                    <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                      Minutos máximos permitidos.
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: colors.text,
                        borderColor: colors.surfaceBorder,
                        fontFamily: theme.typography.fontFamily.semiBold,
                      },
                    ]}
                    keyboardType="number-pad"
                    value={config.timeLimitMinutes.toString()}
                    onChangeText={handleSetTimeLimit}
                  />
                  <Text style={[styles.unitText, { color: colors.text }]}>min</Text>
                </View>
              ) : (
                <View style={styles.settingInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>Hora de Bloqueo</Text>
                    <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                      Hora de inicio en formato HH:MM de 24h.
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: colors.text,
                        borderColor: colors.surfaceBorder,
                        fontFamily: theme.typography.fontFamily.semiBold,
                        width: 80,
                      },
                    ]}
                    maxLength={5}
                    placeholder="22:00"
                    value={config.fixedScheduleTime}
                    onChangeText={(val) => updateConfig({ fixedScheduleTime: val })}
                  />
                </View>
              )}
            </View>

            {/* Blocked Applications Selection */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>REDES SOCIALES A LIMITAR</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {AVAILABLE_APPS.map((app, index) => {
                const isBlocked = config.socialAppsBlocked.includes(app);
                const isLast = index === AVAILABLE_APPS.length - 1;
                return (
                  <TouchableOpacity
                    key={app}
                    onPress={() => handleToggleBlock(app)}
                    style={[
                      styles.appRow,
                      !isLast && styles.borderBottom,
                      !isLast && { borderBottomColor: colors.surfaceBorder },
                    ]}
                  >
                    <Text style={[styles.appLabel, { color: colors.text }]}>{app}</Text>
                    <Switch
                      value={isBlocked}
                      onValueChange={() => handleToggleBlock(app)}
                      trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
                      thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
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
    paddingBottom: 20,
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
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs - 1,
    letterSpacing: 1,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: 16,
    ...theme.shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
  },
  cardDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs + 1,
    marginTop: 2,
    lineHeight: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm + 1,
  },
  optionDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  settingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.xs,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
    width: 60,
    marginRight: 8,
  },
  unitText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  appLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm + 1,
  },
});
