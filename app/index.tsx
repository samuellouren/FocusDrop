import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTimer } from '../hooks/useTimer';
import { CHAVE_DURACAO_PADRAO } from '../constants/keys';
import { TimerRing } from '../components/ui/TimerRing';
import { pedirPermissao } from '../services/notifications';

const DURATIONS = [1, 5, 10, 25, 50];

export default function FocusScreen() {
    const [minutosSelecionados, setMinutosSelecionados] = useState(25);
    const { seconds, isRunning, start, pause, reset } = useTimer(minutosSelecionados * 60);

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(CHAVE_DURACAO_PADRAO).then(valor => {
                if (valor) setMinutosSelecionados(Number(valor));
            });
        }, [])
    );
    useEffect(() => {
        pedirPermissao();
    }, []);

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    return (
        <View style={styles.container}>
            <View style={styles.durations}>
                {DURATIONS.map(min =>(
                    <TouchableOpacity
                        key={min}
                        style={[styles.botaoDuracao, minutosSelecionados === min && styles.botaoDuracaoSelecionado]}
                        onPress={() => setMinutosSelecionados(min)}
                    >
                        <Text style={styles.bntTexto}>{min}m</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.timerContainer}>
                <TimerRing seconds={seconds} totalSeconds={minutosSelecionados * 60} />
                <Text style={styles.timer}>{display}</Text>
            </View>

            <View style={styles.controles}>
                <TouchableOpacity style={styles.bnt} onPress={reset}>
                    <Text style={styles.bntTexto}>Resetar</Text>
                </TouchableOpacity>
            
                <TouchableOpacity style={[styles.bnt, styles.bntPrimario]} onPress={isRunning ? pause : start}>
                    <Text style={[styles.bntTexto, styles.bntPrimarioTexto]}>
                        {isRunning ? 'Pausar' : 'Começar'}
                    </Text>
                </TouchableOpacity>
            </View>

        </View>

    );
}

// StyleSheet — remover durationText, já está coberto por bntTexto
const styles = StyleSheet.create({
  container:              { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f' },
  durations:              { flexDirection: 'row', gap: 12, marginBottom: 60 },
  botaoDuracao:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  botaoDuracaoSelecionado:{ borderColor: '#fff', backgroundColor: '#1a1a1a' },
  timer:                  { fontSize: 80, fontWeight: '200', color: '#fff', letterSpacing: 4, position: 'absolute'},
  controles:              { flexDirection: 'row', gap: 16 },
  bnt:                    { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  bntPrimario:            { backgroundColor: '#fff', borderColor: '#fff' },
  bntTexto:               { color: '#888', fontSize: 16 },
  bntPrimarioTexto:       { color: '#000' },
  timerContainer:         {alignItems: 'center', width: 280, height: 280, justifyContent: 'center', marginBottom: 60},
});