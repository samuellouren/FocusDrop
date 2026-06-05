import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { CHAVE_DURACAO_PADRAO } from '../constants/keys';
import { TECNICAS } from '../hooks/useCycle';
import { Tecnica } from '../types/session';
import { salvarMetaMinutos, buscarMetaMinutos } from '../services/storage';


const TECNICA_LABELS: Record<Tecnica, { nome: string; descricao: string }> = {
  'pomodoro': { nome: 'Pomodoro', descricao: 'Ciclos automáticos foco → pausa' },
  'foco':     { nome: 'Foco',     descricao: 'Timer simples sem pausa automática' },
};

const METAS_MINUTOS = [
  { label: '1h',   valor: 60 },
  { label: '2h',   valor: 120 },
  { label: '3h',   valor: 180 },
  { label: '4h',   valor: 240 },
];

export default function TelaConfiguracoes() {
  const [tecnicaPadrao, setTecnicaPadrao] = useState<Tecnica>('pomodoro');
  const [metaMinutos, setMetaMinutos] = useState(120);
  const [vibrar, setVibrar] = useState(true);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_DURACAO_PADRAO).then(valor => {
        if (valor && valor in TECNICAS) setTecnicaPadrao(valor as Tecnica);
      });
      buscarMetaMinutos().then(setMetaMinutos);
    }, [])
  );

  async function salvarTecnica(tecnica: Tecnica) {
    setTecnicaPadrao(tecnica);
    await AsyncStorage.setItem(CHAVE_DURACAO_PADRAO, tecnica);
  }

  async function salvarMeta(minutos: number) {
    setMetaMinutos(minutos);
    await salvarMetaMinutos(minutos);
  }

  return (
  <ScrollView style={styles.container}>
    <Text style={styles.titulo}>Configurações</Text>

    {/* técnica padrão */}
    <Text style={styles.secao}>Técnica padrão</Text>
    <View style={styles.opcoes}>
      {(Object.keys(TECNICA_LABELS) as Tecnica[]).map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.opcao, tecnicaPadrao === t && styles.opcaoAtiva]}
          onPress={() => salvarTecnica(t)}
        >
          <Text style={[styles.opcaoNome, tecnicaPadrao === t && styles.opcaoNomeAtivo]}>
            {TECNICA_LABELS[t].nome}
          </Text>
          <Text style={styles.opcaoDesc}>{TECNICA_LABELS[t].descricao}</Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* meta diária */}
    <Text style={styles.secao}>Meta diária de foco</Text>
    <View style={styles.metaOpcoes}>
      {METAS_MINUTOS.map(m => (
        <TouchableOpacity
          key={m.valor}
          style={[styles.metaBtn, metaMinutos === m.valor && styles.metaBtnAtivo]}
          onPress={() => salvarMeta(m.valor)}
        >
          <Text style={[styles.metaTexto, metaMinutos === m.valor && styles.metaTextoAtivo]}>
            {m.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={styles.dica}>
      Meta atual: {Math.floor(metaMinutos / 60)}h{metaMinutos % 60 > 0 ? ` ${metaMinutos % 60}min` : ''} de foco por dia
    </Text>

    {/* vibração */}
    <View style={styles.toggle}>
      <View>
        <Text style={styles.toggleNome}>Vibrar ao completar</Text>
        <Text style={styles.toggleDesc}>Vibração ao fim de cada sessão</Text>
      </View>
      <Switch
        value={vibrar}
        onValueChange={setVibrar}
        trackColor={{ false: '#1a1a1a', true: '#fff' }}
        thumbColor={vibrar ? '#000' : '#333'}
      />
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0f0f0f', padding: 24, paddingTop: 60 },
  titulo:         { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 32 },
  secao:          { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  opcoes:         { gap: 8, marginBottom: 32 },
  opcao:          { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#111' },
  opcaoAtiva:     { borderColor: '#fff' },
  opcaoNome:      { fontSize: 15, color: '#444', marginBottom: 2 },
  opcaoNomeAtivo: { color: '#fff' },
  opcaoDesc:      { fontSize: 12, color: '#333' },
  metaOpcoes:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
  metaBtn:        { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  metaBtnAtivo:   { borderColor: '#fff', backgroundColor: '#1a1a1a' },
  metaTexto:      { color: '#444', fontSize: 15 },
  metaTextoAtivo: { color: '#fff' },
  dica:           { fontSize: 12, color: '#333', marginBottom: 32 },
  toggle:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#111' },
  toggleNome:     { fontSize: 15, color: '#fff', marginBottom: 2 },
  toggleDesc:     { fontSize: 12, color: '#333' },
});