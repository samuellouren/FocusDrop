import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModalHumor } from '../components/ui/ModalHumor';
import { CHAVE_LEMBRETE_ATIVO, CHAVE_LEMBRETE_HORA } from '../constants/keys';
import { agendarLembreteDiario } from '../services/notifications';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_LEMBRETE_ATIVO).then(ativo => {
      if (ativo !== 'true') return;
      AsyncStorage.getItem(CHAVE_LEMBRETE_HORA).then(hora => {
        agendarLembreteDiario(hora ? parseInt(hora) : 9, 0).catch(console.error);
      });
    });
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ModalHumor />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="atividade/[id]" />
          <Stack.Screen name="etapa/[id]" />
          <Stack.Screen name="descanso" />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
