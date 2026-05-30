import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { CHAVE_DURACAO_PADRAO } from '../constants/keys';

const DURATIONS = [1, 5, 10, 25, 50];


export default function TelaConfig() {
    const [duracaoSelecionada, setDuracaoSelecionada] = useState(25);

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(CHAVE_DURACAO_PADRAO).then(valor => {
                if (valor) setDuracaoSelecionada(Number(valor));
            });
        }, [])
    );

    async function salvaDuracao(minutos:number) {
        setDuracaoSelecionada(minutos)
        await AsyncStorage.setItem(CHAVE_DURACAO_PADRAO, String(minutos));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Configurações</Text>
            <Text style={styles.label}>Duração padrão</Text>
            <View style={styles.opcoes}>
                {DURATIONS.map(min =>(
                    <TouchableOpacity
                    key={min}
                    style={[styles.opcao, duracaoSelecionada === min && styles.opcaoAtiva]}
                    onPress={() => salvaDuracao(min)}
                    >
                        <Text style={[styles.textoOpcao, duracaoSelecionada === min && styles.textoOpcaoAtivo]}>
                            {min}m
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.dica}>
                A tela de foco vai iniciar com {duracaoSelecionada} minutos por padrão.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0f0f0f', padding: 24, paddingTop: 60 },
  titulo:         { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 40 },
  label:          { fontSize: 13, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  opcoes:         { flexDirection: 'row', gap: 12, marginBottom: 20 },
  opcao:          { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  opcaoAtiva:     { borderColor: '#fff', backgroundColor: '#1a1a1a' },
  textoOpcao:     { color: '#444', fontSize: 16 },
  textoOpcaoAtivo:{ color: '#fff' },
  dica:           { fontSize: 13, color: '#333', lineHeight: 20 },
});