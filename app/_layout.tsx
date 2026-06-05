import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ModalHumor } from '../components/ui/ModalHumor';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IoniconName, IoniconName]> = {
  index:         ['timer',     'timer-outline'],
  rotina:        ['list',      'list-outline'],
  estatisticas:  ['bar-chart', 'bar-chart-outline'],
  historico:     ['time',      'time-outline'],
  configuracoes: ['settings',  'settings-outline'],
};

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalHumor />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#1a1a1a' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#444',
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            if (!icons) return null;
            return <Ionicons name={focused ? icons[0] : icons[1]} size={size} color={color} />;
          },
        })}
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