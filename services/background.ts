import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const TIMER_TASK = 'FOCUSDROP_TIMER_TASK';

export async function iniciarNotificacaoPersistente(segundosRestantes: number, ciclo: 'foco' | 'pausa'): Promise<string> {
  if (Platform.OS === 'web') return '';  // ← ignora no browser

  await Notifications.dismissAllNotificationsAsync();
  const mins = Math.floor(segundosRestantes / 60);
  const segs = segundosRestantes % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  const emoji = ciclo === 'foco' ? '🎯' : '☕';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} ${ciclo === 'foco' ? 'Foco' : 'Pausa'} — ${display}`,
      body: ciclo === 'foco' ? 'Mantenha o foco!' : 'Descanse um pouco.',
      sound: false,
    },
    trigger: null,
  });

  return id;
}

export async function atualizarNotificacaoPersistente(
  notificacaoId: string,
  segundosRestantes: number,
  ciclo: 'foco' | 'pausa'
): Promise<void> {
  if (Platform.OS === 'web') return;  // ← ignora no browser

  const mins = Math.floor(segundosRestantes / 60);
  const segs = segundosRestantes % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  const emoji = ciclo === 'foco' ? '🎯' : '☕';

  await Notifications.scheduleNotificationAsync({
    identifier: notificacaoId,
    content: {
      title: `${emoji} ${ciclo === 'foco' ? 'Foco' : 'Pausa'} — ${display}`,
      body: ciclo === 'foco' ? 'Mantenha o foco!' : 'Descanse um pouco.',
      sound: false,
    },
    trigger: null,
  });
}

export async function cancelarNotificacaoPersistente(): Promise<void> {
  if (Platform.OS === 'web') return;  // ← ignora no browser
  await Notifications.dismissAllNotificationsAsync();
}