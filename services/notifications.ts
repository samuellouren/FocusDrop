import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function pedirPermissao(): Promise<boolean> {
    const {status} = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function notificarSessaoCompleta(minutos: number): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sessao completa!!',
      body: `Você completou ${minutos} minutos de foco. bom trabalho!!`,
      sound: true,
    },
    trigger: null,
  });
}