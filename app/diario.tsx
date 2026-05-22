import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreationsStore } from '@/src/store/creationsStore';
import { theme } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DiarioScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = theme.colors[colorScheme];
  const router = useRouter();

  const { addJournal } = useCreationsStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Neutral 😐');

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Escribe algo', 'Por favor escribe un pensamiento en tu diario antes de guardar.');
      return;
    }

    addJournal({
      title: title.trim() || 'Escrito sin título',
      content: content.trim(),
      mood,
    });

    Alert.alert('¡Guardado!', 'Tu entrada de diario ha sido guardada con éxito.', [
      { text: 'Aceptar', onPress: () => router.back() },
    ]);
  };

  const moods = ['Calma 🧘', 'Neutral 😐', 'Feliz 😊', 'Ansioso 😰', 'Cansado 😴'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Navigation Header */}
        <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Diario</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveText, { color: colors.primary }]}>Guardar</Text>
          </TouchableOpacity>
        </View>

        {/* Editor Inputs */}
        <View style={styles.content}>
          <TextInput
            placeholder="Título del escrito..."
            placeholderTextColor={colors.textMuted}
            style={[styles.titleInput, { color: colors.text, fontFamily: theme.typography.fontFamily.bold }]}
            value={title}
            onChangeText={setTitle}
          />

          {/* Mood Selector */}
          <View style={styles.moodContainer}>
            <Text style={[styles.moodLabel, { color: colors.textMuted }]}>Estado de ánimo:</Text>
            <View style={styles.moodGrid}>
              {moods.map((m) => {
                const isActive = mood === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMood(m)}
                    style={[
                      styles.moodBtn,
                      isActive && { backgroundColor: colors.primary },
                      !isActive && { borderColor: colors.surfaceBorder, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.moodText, isActive ? { color: colors.white } : { color: colors.text }]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TextInput
            placeholder="Comienza a escribir tus reflexiones libres de redes sociales..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[styles.editorInput, { color: colors.text, fontFamily: theme.typography.fontFamily.regular }]}
            value={content}
            onChangeText={setContent}
          />
        </View>
      </KeyboardAvoidingView>
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
  },
  backText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.md - 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  saveButton: {
    paddingVertical: 6,
  },
  saveText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md - 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    fontSize: theme.typography.sizes.xl,
    paddingVertical: 8,
    marginBottom: 16,
  },
  moodContainer: {
    marginBottom: 16,
  },
  moodLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.xs,
    marginBottom: 8,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  moodText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs + 1,
  },
  editorInput: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    lineHeight: 22,
    marginTop: 8,
  },
});
