import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalHumor } from '../components/ui/ModalHumor';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalHumor />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#1a1a1a' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#444',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Foco' }} />
        <Tabs.Screen name="rotina" options={{ title: 'Rotina' }} />
        <Tabs.Screen name="estatisticas" options={{ title: 'Stats' }} />
        <Tabs.Screen name="historico" options={{ title: 'Histórico' }} />
        <Tabs.Screen name="configuracoes" options={{ title: 'Config' }} />
        <Tabs.Screen name="atividade/[id]" options={{ href: null }} />
        <Tabs.Screen name="etapa/[id]" options={{ href: null }} />
        <Tabs.Screen name="descanso" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}