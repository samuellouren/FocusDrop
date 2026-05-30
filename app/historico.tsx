import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { buscarSessoes } from '../services/storage';
import { Session } from '../types/session';

export default function TelaHistorico() {
  const [sessoes, setSessoes] = useState<Session[]>([]);

  
  useFocusEffect(
    useCallback(() => {
      buscarSessoes().then(setSessoes);
    }, [])
  );

  function formatarData(iso: string) {
    const data = new Date(iso);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatarDuracao(segundos: number) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;


    const partes = [];
    if (horas > 0)   partes.push(`${horas}h`);
    if (minutos > 0) partes.push(`${minutos}min`);
    if (segs > 0)    partes.push(`${segs}s`);

    return partes.join(' ');
}

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>

      {sessoes.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma sessão completada ainda...</Text>
      ) : (
        <FlatList
          data={sessoes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.duracao}>{formatarDuracao(item.duration)}</Text>
              <Text style={styles.data}>{formatarData(item.completedAt)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 24, paddingTop: 60 },
  titulo:    { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 32 },
  vazio:     { color: '#444', fontSize: 16, textAlign: 'center', marginTop: 60 },
  card:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  duracao:   { fontSize: 18, color: '#fff', fontWeight: '300' },
  data:      { fontSize: 13, color: '#555' },
});