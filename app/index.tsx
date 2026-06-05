import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCycle, TECNICAS, ConfigCiclo } from '../hooks/useCycle';
import { TimerRing } from '../components/ui/TimerRing';
import { CHAVE_DURACAO_PADRAO } from '../constants/keys';
import { Tecnica } from '../types/session';
import { pedirPermissao } from '../services/notifications';

const TECNICA_LABELS: Record<Tecnica, string> = {
  'pomodoro': 'Pomodoro',
  'foco': 'Foco',
};

export default function TelaFoco() {
  const [tecnicaSelecionada, setTecnicaSelecionada] = useState<Tecnica>('pomodoro');
  const [config, setConfig] = useState<ConfigCiclo>({
    tecnica: 'pomodoro',
    horasFoco: 0,
    minutosFoco: 25,
    minutosParao: 5,
    horasParusa: 0,
    segundosFoco: 0,
    segundosPausa: 0,
  });

  const [horasFoco, setHorasFoco]         = useState('0');
  const [minutosFoco, setMinutosFoco]     = useState('25');
  const [segundosFoco, setSegundosFoco]   = useState('0');
  const [horasPausa, setHorasPausa]       = useState('0');
  const [minutosPausa, setMinutosPausa]   = useState('5');
  const [segundosPausa, setSegundosPausa] = useState('0');

  const { seconds, isRunning, cicloAtual, numeroCiclo, start, pause, reset } = useCycle(config);

  useEffect(() => {
    pedirPermissao();
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_DURACAO_PADRAO).then(valor => {
        if (valor && valor in TECNICAS) {
          const tecnica = valor as Tecnica;
          setTecnicaSelecionada(tecnica);
          aplicarTempo(tecnica);
        } else if (valor) {
          AsyncStorage.removeItem(CHAVE_DURACAO_PADRAO);
        }
      });
    }, [])
  );

  function aplicarTempo(
    tecnica: Tecnica,
    hf = horasFoco,
    mf = minutosFoco,
    sf = segundosFoco,
    hp = horasPausa,
    mp = minutosPausa,
    sp = segundosPausa
  ) {
    setConfig({
      tecnica,
      horasFoco:    Number(hf) || 0,
      minutosFoco:  Number(mf) || 25,
      segundosFoco: Number(sf) || 0,
      horasParusa:  tecnica === 'pomodoro' ? (Number(hp) || 0) : 0,
      minutosParao: tecnica === 'pomodoro' ? (Number(mp) || 5) : 0,
      segundosPausa: tecnica === 'pomodoro' ? (Number(sp) || 0) : 0,
    });
  }

  function selecionarTecnica(tecnica: Tecnica) {
    setTecnicaSelecionada(tecnica);
    aplicarTempo(tecnica);
    reset();
  }

  const mins = Math.floor(seconds / 60);
  const segs = seconds % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;

  const totalSegundos = cicloAtual === 'foco'
    ? ((config.horasFoco   || 0) * 3600) + (config.minutosFoco  * 60) + (config.segundosFoco  || 0)
    : ((config.horasParusa || 0) * 3600) + (config.minutosParao * 60) + (config.segundosPausa || 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* seletor de técnica */}
      <View style={styles.tecnicas}>
        {(Object.keys(TECNICA_LABELS) as Tecnica[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tecnicaBtn, tecnicaSelecionada === t && styles.tecnicaBtnAtivo]}
            onPress={() => selecionarTecnica(t)}
          >
            <Text style={[styles.tecnicaTexto, tecnicaSelecionada === t && styles.tecnicaTextoAtivo]}>
              {TECNICA_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* inputs de tempo */}
      <View style={styles.inputContainer}>
        <View style={styles.inputGrupo}>
          <Text style={styles.inputLabel}>Foco</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={horasFoco}
              onChangeText={setHorasFoco}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0"
              placeholderTextColor="#333"
              onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
            />
            <Text style={styles.inputSeparador}>h</Text>
            <TextInput
              style={styles.input}
              value={minutosFoco}
              onChangeText={setMinutosFoco}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="25"
              placeholderTextColor="#333"
              onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
            />
            <Text style={styles.inputSeparador}>m</Text>
            <TextInput
              style={styles.input}
              value={segundosFoco}
              onChangeText={setSegundosFoco}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0"
              placeholderTextColor="#333"
              onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
            />
            <Text style={styles.inputSeparador}>s</Text>
          </View>
        </View>

        {tecnicaSelecionada === 'pomodoro' && (
          <View style={styles.inputGrupo}>
            <Text style={styles.inputLabel}>Pausa</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={horasPausa}
                onChangeText={setHorasPausa}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
                placeholderTextColor="#333"
                onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
              />
              <Text style={styles.inputSeparador}>h</Text>
              <TextInput
                style={styles.input}
                value={minutosPausa}
                onChangeText={setMinutosPausa}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="5"
                placeholderTextColor="#333"
                onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
              />
              <Text style={styles.inputSeparador}>m</Text>
              <TextInput
                style={styles.input}
                value={segundosPausa}
                onChangeText={setSegundosPausa}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
                placeholderTextColor="#333"
                onBlur={() => aplicarTempo(tecnicaSelecionada, horasFoco, minutosFoco, segundosFoco, horasPausa, minutosPausa, segundosPausa)}
              />
              <Text style={styles.inputSeparador}>s</Text>
            </View>
          </View>
        )}
      </View>

      {/* info do ciclo */}
      <View style={styles.cicloInfo}>
        <Text style={styles.cicloTexto}>
          {cicloAtual === 'foco' ? '🎯 Foco' : '☕ Pausa'} · Ciclo {numeroCiclo}
        </Text>
      </View>

      {/* timer com anel */}
      <View style={styles.timerContainer}>
        <TimerRing
          seconds={seconds}
          totalSeconds={totalSegundos}
          cor={cicloAtual === 'foco' ? '#ffffff' : '#555555'}
        />
        <Text style={styles.timer}>{display}</Text>
      </View>

      {/* controles */}
      <View style={styles.controles}>
        <TouchableOpacity style={styles.botao} onPress={reset}>
          <Text style={styles.textoBotao}>Resetar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoPrimario]}
          onPress={isRunning ? pause : start}
        >
          <Text style={[styles.textoBotao, styles.textoBotaoPrimario]}>
            {isRunning ? 'Pausar' : 'Começar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', padding: 24 },
  tecnicas:           { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tecnicaBtn:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  tecnicaBtnAtivo:    { borderColor: '#fff', backgroundColor: '#1a1a1a' },
  tecnicaTexto:       { color: '#444', fontSize: 13 },
  tecnicaTextoAtivo:  { color: '#fff' },
  inputContainer:     { flexDirection: 'row', gap: 24, marginBottom: 20 },
  inputGrupo:         { alignItems: 'center', gap: 6 },
  inputLabel:         { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 },
  inputRow:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input:              { width: 44, height: 44, backgroundColor: '#111', borderRadius: 8, borderWidth: 1, borderColor: '#222', color: '#fff', fontSize: 18, textAlign: 'center', textAlignVertical: 'center' },
  inputSeparador:     { color: '#333', fontSize: 16 },
  cicloInfo:          { marginBottom: 16 },
  cicloTexto:         { color: '#555', fontSize: 13 },
  timerContainer:     { width: 280, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  timer:              { fontSize: 64, fontWeight: '200', color: '#fff', letterSpacing: 4, position: 'absolute' },
  controles:          { flexDirection: 'row', gap: 16 },
  botao:              { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  botaoPrimario:      { backgroundColor: '#fff', borderColor: '#fff' },
  textoBotao:         { color: '#888', fontSize: 16 },
  textoBotaoPrimario: { color: '#000' },
});