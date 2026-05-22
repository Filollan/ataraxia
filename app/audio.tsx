import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AudioScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const router = useRouter();

  const { addAudio } = useCreationsStore();

  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setDuration(0);
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRecording(false);
  };

  const handleSave = () => {
    if (duration === 0) {
      Alert.alert('Graba algo', 'Por favor inicia la grabación antes de guardar.');
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    addAudio({
      title: title.trim() || 'Grabación de voz',
      uri: 'mock_local_audio_path_' + Date.now() + '.m4a', // Mock local file path
      durationMs: duration * 1000,
    });

    Alert.alert('¡Guardado!', 'Tu grabación de audio ha sido guardada con éxito.', [
      { text: 'Aceptar', onPress: () => router.back() },
    ]);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => { stopRecording(); router.back(); }} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Grabar Audio</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Title Input */}
        <TextInput
          placeholder="Nombre de la grabación..."
          placeholderTextColor={colors.textMuted}
          style={[styles.titleInput, { color: colors.text, borderColor: colors.surfaceBorder, fontFamily: theme.typography.fontFamily.semiBold }]}
          value={title}
          onChangeText={setTitle}
        />

        {/* Timer Visualizer */}
        <View style={styles.visualizerContainer}>
          <Text style={[styles.timerText, { color: colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {formatDuration(duration)}
          </Text>
          <Text style={[styles.statusText, { color: isRecording ? colors.danger : colors.textMuted }]}>
            {isRecording ? 'Grabando audio...' : 'Listo para grabar'}
          </Text>

          {/* Simple animated pulse indicator for recording */}
          {isRecording && (
            <View style={[styles.pulseCircle, { backgroundColor: colors.danger }]} />
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {isRecording ? (
            <TouchableOpacity onPress={stopRecording} style={[styles.recordButton, { backgroundColor: colors.text }]}>
              <View style={[styles.squareIcon, { backgroundColor: colors.white }]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={[styles.recordButton, { backgroundColor: colors.danger }]}>
              <View style={[styles.circleIcon, { backgroundColor: colors.white }]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Save CTA */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={duration === 0}
          style={[
            styles.saveButton,
            { backgroundColor: duration === 0 ? colors.surfaceBorder : colors.accent },
          ]}
        >
          <Text style={[styles.saveButtonText, { color: colors.white, fontFamily: theme.typography.fontFamily.bold }]}>
            Guardar Grabación
          </Text>
        </TouchableOpacity>
      </View>
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
    width: 60,
  },
  backText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.md - 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleInput: {
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    width: '100%',
    textAlign: 'center',
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  timerText: {
    fontSize: 56,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pulseCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  controlsContainer: {
    marginBottom: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  circleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  squareIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    ...theme.shadows.sm,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.md,
  },
});
