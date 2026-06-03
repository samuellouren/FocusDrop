import { Tabs } from 'expo-router';

export default function Layout() {
    return(
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {backgroundColor: '#0f0f0f', borderTopColor: '#1a1a1a' },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#444',
            }}
        >
            <Tabs.Screen name='index' options={{ title: 'Foco'}} />
            <Tabs.Screen name="estatisticas" options={{ title: 'Stats' }} />
            <Tabs.Screen name='historico' options={{title: 'Histórico'}} />
            <Tabs.Screen name="configuracoes" options={{ title: 'Config' }} />
        </Tabs>
    );
}