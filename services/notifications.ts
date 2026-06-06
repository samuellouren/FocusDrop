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

export async function notificarSessaoCompleta(minutos: number): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sessão completa!',
      body: `Você completou ${minutos} minutos de foco. Bom trabalho!`,
      sound: true,
    },
    trigger: null,
  });
}
