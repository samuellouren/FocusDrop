import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IoniconName, IoniconName]> = {
  index:         ['timer',     'timer-outline'],
  rotina:        ['list',      'list-outline'],
  estatisticas:  ['bar-chart', 'bar-chart-outline'],
  historico:     ['time',      'time-outline'],
  configuracoes: ['settings',  'settings-outline'],
};

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textFaint,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return <Ionicons name={focused ? icons[0] : icons[1]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index"        options={{ title: 'Foco' }} />
      <Tabs.Screen name="rotina"       options={{ title: 'Rotina' }} />
      <Tabs.Screen name="estatisticas" options={{ title: 'Stats' }} />
      <Tabs.Screen name="historico"    options={{ title: 'Histórico' }} />
      <Tabs.Screen name="configuracoes" options={{ title: 'Config' }} />
    </Tabs>
  );
}
