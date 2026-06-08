import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCycle, ConfigCiclo } from '../../hooks/useCycle';
import { TimerRing } from '../../components/ui/TimerRing';
import { buscarAtividades, atualizarAtividade } from '../../services/rotina';
import { Atividade, Etapa } from '../../types/rotina';

export default function TelaEtapa() {
  const { id, atividadeId } = useLocalSearchParams<{ id: string; atividadeId: string }>();

  const [etapa, setEtapa] = useState<Etapa | null>(null);
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [modoExecucao, setModoExecucao] = useState(false);

  const [config, setConfig] = useState<ConfigCiclo>({
    tecnica: 'foco',
    minutosFoco: 5,
    minutosParao: 0,
    horasFoco: 0,
    horasParusa: 0,
    segundosFoco: 0,
    segundosPausa: 0,
  });

  const { seconds, isRunning, cicloAtual, numeroCiclo, start, pause, reset } = useCycle(config);

  const hasRunRef = useRef(false);
  const concludedRef = useRef(false);

  useEffect(() => {
    carregarEtapa();
  }, [id]);

  useEffect(() => {
    if (!modoExecucao) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [modoExecucao]);

  useEffect(() => {
    if (isRunning) hasRunRef.current = true;
  }, [isRunning]);

  useEffect(() => {
    if (
      !hasRunRef.current ||
      concludedRef.current ||
      seconds !== 0 ||
      isRunning ||
      !modoExecucao ||
      !etapa?.temTimer
    ) return;
    concludedRef.current = true;
    handleConcluir();
  }, [seconds, isRunning, modoExecucao, etapa, atividade]);

  async function carregarEtapa() {
    const todas = await buscarAtividades();
    const ativ = todas.find(a => a.id === atividadeId);
    if (!ativ) return;
    setAtividade(ativ);
    const etapaEncontrada = ativ.etapas?.find(e => e.id === id);
    if (!etapaEncontrada) return;
    setEtapa(etapaEncontrada);
    if (etapaEncontrada.temTimer && etapaEncontrada.duracao) {
      setConfig({
        tecnica: 'foco',
        minutosFoco: Math.floor(etapaEncontrada.duracao / 60),
        minutosParao: 0,
        horasFoco: 0,
        horasParusa: 0,
        segundosFoco: etapaEncontrada.duracao % 60,
        segundosPausa: 0,
      });
    }
  }

  async function handleConcluir() {
    if (!atividade || !etapa) return;
    const novasEtapas = atividade.etapas?.map(e =>
      e.id === etapa.id ? { ...e, concluida: true } : e
    );
    await atualizarAtividade(atividade.id, { etapas: novasEtapas });
    const duracaoSeg = etapa.duracao ?? totalSegundos;
    router.replace(`/descanso?duracaoTrabalho=${duracaoSeg}`);
  }

  const mins = Math.floor(seconds / 60);
  const segs = seconds % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  const totalSegundos = (config.minutosFoco * 60) + (config.segundosFoco || 0);

  if (!etapa) return null;

  if (!modoExecucao) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Text style={styles.btnVoltarTexto}>← Voltar</Text>
        </TouchableOpacity>
        {atividade && <Text style={styles.atividadeNome}>{atividade.titulo}</Text>}
        <Text style={styles.titulo}>{etapa.titulo}</Text>
        {etapa.temTimer && etapa.duracao ? (
          <Text style={styles.meta}>
            ⏱ {Math.floor(etapa.duracao / 60)}min
            {etapa.duracao % 60 > 0 ? ` ${etapa.duracao % 60}s` : ''}
          </Text>
        ) : (
          <Text style={styles.meta}>✓ Etapa livre</Text>
        )}
        <TouchableOpacity
          style={[styles.botao, styles.botaoPrimario, { marginTop: 40 }]}
          onPress={() => setModoExecucao(true)}
        >
          <Text style={[styles.textoBotao, styles.textoBotaoPrimario]}>Iniciar etapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {atividade && <Text style={styles.atividadeNome}>{atividade.titulo}</Text>}
      <Text style={styles.titulo}>{etapa.titulo}</Text>
      {etapa.temTimer ? (
        <>
          <Text style={styles.cicloTexto}>
            {cicloAtual === 'foco' ? '🎯 Foco' : '☕ Pausa'} · Ciclo {numeroCiclo}
          </Text>
          <View style={styles.timerContainer}>
            <TimerRing seconds={seconds} totalSeconds={totalSegundos} cor="#ffffff" />
            <Text style={styles.timer}>{display}</Text>
          </View>
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
        </>
      ) : null}
      <TouchableOpacity style={styles.btnConcluir} onPress={handleConcluir}>
        <Text style={styles.btnConcluirTexto}>✓ Concluir etapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  btnVoltar:          { position: 'absolute', top: 60, left: 24 },
  btnVoltarTexto:     { color: '#555', fontSize: 14 },
  atividadeNome:      { fontSize: 13, color: '#444', marginBottom: 8 },
  titulo:             { fontSize: 28, fontWeight: '300', color: '#fff', textAlign: 'center', marginBottom: 8 },
  meta:               { fontSize: 13, color: '#555' },
  cicloTexto:         { color: '#555', fontSize: 13, marginBottom: 16 },
  timerContainer:     { width: 280, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  timer:              { fontSize: 64, fontWeight: '200', color: '#fff', letterSpacing: 4, position: 'absolute' },
  controles:          { flexDirection: 'row', gap: 16, marginBottom: 32 },
  btnConcluir:        { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  btnConcluirTexto:   { color: '#fff', fontSize: 16 },
  botao:              { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  botaoPrimario:      { backgroundColor: '#fff', borderColor: '#fff' },
  textoBotao:         { color: '#888', fontSize: 16 },
  textoBotaoPrimario: { color: '#000' },
});