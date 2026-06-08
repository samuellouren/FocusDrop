import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo && Platform.OS !== 'web') {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function pedirPermissao(): Promise<boolean> {
  if (isExpoGo || Platform.OS === 'web') return false;
  const Notifications = require('expo-notifications');
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function notificarSessaoCompleta(segundos: number): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  const body = segundos < 60
    ? `Parabéns! Você concluiu ${segundos} seg. de foco.`
    : `Você completou ${Math.floor(segundos / 60)} min. de foco. Bom trabalho!`;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sessão completa!',
      body,
      sound: true,
    },
    trigger: null,
  });
}

export async function notificarPausaConcluida(): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☕ Pausa encerrada!',
      body: 'Hora de voltar ao foco. Você consegue!',
      sound: true,
    },
    trigger: null,
  });
}

export async function notificarDescansoConcluido(): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Descanso concluído!',
      body: 'Pronto para a próxima etapa? Vamos lá!',
      sound: true,
    },
    trigger: null,
  });
}

const ID_LEMBRETE_DIARIO = 'lembrete_diario_focusdrop';

export async function agendarLembreteDiario(hora: number, minuto: number): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: ID_LEMBRETE_DIARIO,
    content: {
      title: '🎯 FocusDrop',
      body: 'Não esqueça de manter seu foco hoje! Abra o app e comece.',
      sound: true,
    },
    trigger: {
      type: 'daily',
      hour: hora,
      minute: minuto,
    },
  });
}

export async function cancelarLembreteDiario(): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO).catch(() => {});
}

export async function agendarLembreteAtividade(
  id: string, titulo: string, data: string, horaInicio: string
): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  const trigger = new Date(`${data}T${horaInicio}:00`);
  if (trigger <= new Date()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `atividade_${id}`,
    content: { title: '⏰ Hora de começar!', body: titulo, sound: true },
    trigger: { type: 'date', date: trigger },
  });
}

export async function cancelarLembreteAtividade(id: string): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.cancelScheduledNotificationAsync(`atividade_${id}`).catch(() => {});
}
