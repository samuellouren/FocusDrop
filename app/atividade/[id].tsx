import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ScrollView, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCycle, TECNICAS, ConfigCiclo } from '../../hooks/useCycle';
import { TimerRing } from '../../components/ui/TimerRing';
import { salvarAtividade, atualizarAtividade, buscarAtividades } from '../../services/rotina';
import { agendarLembreteAtividade, cancelarLembreteAtividade } from '../../services/notifications';
import { Atividade, Etapa } from '../../types/rotina';
import { Tecnica } from '../../types/session';

export default function TelaAtividade() {
  const { id, data, ordem, modo } = useLocalSearchParams<{ id: string; data: string; ordem: string; modo: string }>();
  const isNova = id === 'nova';
  const isEditar = modo === 'editar';

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [temTimer, setTemTimer] = useState(true);
  const [minutosFoco, setMinutosFoco] = useState('25');
  const [segundosFoco, setSegundosFoco] = useState('0');
  const [tecnica, setTecnica] = useState<Tecnica>('pomodoro');
  const [ehModelo, setEhModelo] = useState(false);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [novaEtapaTitulo, setNovaEtapaTitulo] = useState('');
  const [novaEtapaTemTimer, setNovaEtapaTemTimer] = useState(false);
  const [novaEtapaMinutos, setNovaEtapaMinutos] = useState('5');
  const [novaEtapaSegundos, setNovaEtapaSegundos] = useState('0');
  const [horaH, setHoraH] = useState('');
  const [horaM, setHoraM] = useState('');

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [modoExecucao, setModoExecucao] = useState(false);

  const [config, setConfig] = useState<ConfigCiclo>(TECNICAS['pomodoro']);
  const { seconds, isRunning, cicloAtual, numeroCiclo, start, pause, reset } = useCycle(config);

  useEffect(() => {
    if (!isNova) carregarAtividade();
  }, [id]);

  useEffect(() => {
    if (!modoExecucao) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [modoExecucao]);

  async function carregarAtividade() {
    const todas = await buscarAtividades();
    const found = todas.find(a => a.id === id);
    if (found) {
      setAtividade(found);
      if (isEditar) {
        setTitulo(found.titulo);
        setDescricao(found.descricao || '');
        setTemTimer(found.temTimer);
        setEhModelo(found.ehModelo || false);
        if (found.etapas) setEtapas(found.etapas);
        if (found.duracao) {
          setMinutosFoco(String(Math.floor(found.duracao / 60)));
          setSegundosFoco(String(found.duracao % 60));
        }
        if (found.tecnica) setTecnica(found.tecnica);
        if (found.horaInicio) {
          const [h, m] = found.horaInicio.split(':');
          setHoraH(h);
          setHoraM(m);
        }
      }
      if (found.temTimer && found.duracao) {
        const cfg: ConfigCiclo = {
          tecnica: found.tecnica || 'pomodoro',
          minutosFoco: Math.floor(found.duracao / 60),
          minutosParao: found.tecnica === 'pomodoro' ? 5 : 0,
          horasFoco: 0,
          horasParusa: 0,
          segundosFoco: found.duracao % 60,
          segundosPausa: 0,
        };
        setConfig(cfg);
      }
    }
  }

  function adicionarEtapa() {
    if (!novaEtapaTitulo.trim()) return;
    const duracao = (Number(novaEtapaMinutos) * 60) + Number(novaEtapaSegundos);
    const nova: Etapa = {
      id: Date.now().toString(),
      titulo: novaEtapaTitulo.trim(),
      temTimer: novaEtapaTemTimer,
      duracao: novaEtapaTemTimer ? duracao : undefined,
      concluida: false,
      ordem: etapas.length,
    };
    setEtapas(prev => [...prev, nova]);
    setNovaEtapaTitulo('');
    setNovaEtapaMinutos('5');
    setNovaEtapaSegundos('0');
    setNovaEtapaTemTimer(false);
  }

  function removerEtapa(etapaId: string) {
    setEtapas(prev => prev.filter(e => e.id !== etapaId));
  }

  async function handleSalvar() {
    if (!titulo.trim()) return;
    const duracao = (Number(minutosFoco) * 60) + Number(segundosFoco);
    let horaInicio: string | undefined;
    if (horaH.trim()) {
      const h = Math.min(23, Math.max(0, parseInt(horaH) || 0));
      const m = Math.min(59, Math.max(0, parseInt(horaM) || 0));
      horaInicio = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    let savedId: string;
    let savedData: string;

    if (isEditar && atividade) {
      await atualizarAtividade(atividade.id, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        temTimer,
        duracao: temTimer ? duracao : undefined,
        tecnica: temTimer ? tecnica : undefined,
        ehModelo,
        etapas: etapas.length > 0 ? etapas : undefined,
        horaInicio,
      });
      savedId = atividade.id;
      savedData = atividade.data;
    } else {
      const novaAtividade: Atividade = {
        id: Date.now().toString(),
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        temTimer,
        duracao: temTimer ? duracao : undefined,
        tecnica: temTimer ? tecnica : undefined,
        concluida: false,
        data: data as string,
        ordem: Number(ordem),
        ehModelo,
        etapas: etapas.length > 0 ? etapas : undefined,
        horaInicio,
      };
      await salvarAtividade(novaAtividade);
      savedId = novaAtividade.id;
      savedData = data as string;
    }

    await cancelarLembreteAtividade(savedId);
    if (horaInicio && savedData) {
      agendarLembreteAtividade(savedId, titulo.trim(), savedData, horaInicio).catch(console.error);
    }

    router.back();
  }

  async function handleConcluir() {
    if (atividade) {
      await atualizarAtividade(atividade.id, { concluida: true });
    }
    router.replace('/descanso');
  }

  const mins = Math.floor(seconds / 60);
  const segs = seconds % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  const totalSegundos = (config.minutosFoco * 60) + (config.segundosFoco || 0);

  if (!isNova && !isEditar && atividade && (modoExecucao || !atividade.temTimer)) {
    return (
      <View style={styles.execContainer}>
        <Text style={styles.execTitulo}>{atividade.titulo}</Text>
        {atividade.descricao ? <Text style={styles.execDesc}>{atividade.descricao}</Text> : null}
        {atividade.temTimer ? (
          <>
            <Text style={styles.cicloTexto}>
              {cicloAtual === 'foco' ? '🎯 Foco' : '☕ Pausa'} · Ciclo {numeroCiclo}
            </Text>
            <View style={styles.timerContainer}>
              <TimerRing seconds={seconds} totalSeconds={totalSegundos} cor={cicloAtual === 'foco' ? '#ffffff' : '#555555'} />
              <Text style={styles.timer}>{display}</Text>
            </View>
            <View style={styles.execControles}>
              <TouchableOpacity style={styles.botao} onPress={reset}>
                <Text style={styles.textoBotao}>Resetar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botao, styles.botaoPrimario]} onPress={isRunning ? pause : start}>
                <Text style={[styles.textoBotao, styles.textoBotaoPrimario]}>
                  {isRunning ? 'Pausar' : 'Começar'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
        <TouchableOpacity style={styles.btnConcluir} onPress={handleConcluir}>
          <Text style={styles.btnConcluirTexto}>✓ Concluir atividade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isNova && !isEditar && atividade) {
    return (
      <View style={styles.execContainer}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Text style={styles.btnVoltarTexto}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.execTitulo}>{atividade.titulo}</Text>
        {atividade.descricao ? <Text style={styles.execDesc}>{atividade.descricao}</Text> : null}
        {atividade.temTimer && atividade.duracao ? (
          <Text style={styles.execMeta}>
            ⏱ {Math.floor(atividade.duracao / 60)}min
            {atividade.duracao % 60 > 0 ? ` ${atividade.duracao % 60}s` : ''} · {atividade.tecnica}
          </Text>
        ) : (
          <Text style={styles.execMeta}>⏱ Atividade livre</Text>
        )}
        <TouchableOpacity style={[styles.botao, styles.botaoPrimario, { marginTop: 40 }]} onPress={() => setModoExecucao(true)}>
          <Text style={[styles.textoBotao, styles.textoBotaoPrimario]}>Iniciar atividade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.criarContainer}>
      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.btnVoltarTexto}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.criarTitulo}>{isEditar ? 'Editar atividade' : 'Nova atividade'}</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.inputTexto} value={titulo} onChangeText={setTitulo} placeholder="Ex: Estudar React Native" placeholderTextColor="#333" />

      <Text style={styles.label}>Horário (opcional)</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.inputNumero} value={horaH} onChangeText={setHoraH} keyboardType="number-pad" maxLength={2} placeholder="09" placeholderTextColor="#333" />
        <Text style={styles.inputSep}>:</Text>
        <TextInput style={styles.inputNumero} value={horaM} onChangeText={setHoraM} keyboardType="number-pad" maxLength={2} placeholder="00" placeholderTextColor="#333" />
      </View>

      <Text style={styles.label}>Descrição (opcional)</Text>
      <TextInput style={[styles.inputTexto, styles.inputArea]} value={descricao} onChangeText={setDescricao} placeholder="Detalhes da atividade..." placeholderTextColor="#333" multiline />

      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleNome}>Usar timer</Text>
          <Text style={styles.toggleDesc}>Definir tempo para esta atividade</Text>
        </View>
        <Switch value={temTimer} onValueChange={setTemTimer} trackColor={{ false: '#1a1a1a', true: '#fff' }} thumbColor={temTimer ? '#000' : '#333'} />
      </View>

      {temTimer && (
        <>
          <Text style={styles.label}>Duração do foco</Text>
          <View style={styles.inputRow}>
            <TextInput style={styles.inputNumero} value={minutosFoco} onChangeText={setMinutosFoco} keyboardType="number-pad" maxLength={2} placeholder="25" placeholderTextColor="#333" />
            <Text style={styles.inputSep}>m</Text>
            <TextInput style={styles.inputNumero} value={segundosFoco} onChangeText={setSegundosFoco} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor="#333" />
            <Text style={styles.inputSep}>s</Text>
          </View>
          <Text style={styles.label}>Técnica</Text>
          <View style={styles.tecnicas}>
            {(['pomodoro', 'foco'] as Tecnica[]).map(t => (
              <TouchableOpacity key={t} style={[styles.tecnicaBtn, tecnica === t && styles.tecnicaBtnAtivo]} onPress={() => setTecnica(t)}>
                <Text style={[styles.tecnicaTexto, tecnica === t && styles.tecnicaTextoAtivo]}>{t === 'pomodoro' ? 'Pomodoro' : 'Foco'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleNome}>Atividade modelo</Text>
          <Text style={styles.toggleDesc}>Aparece automaticamente todos os dias</Text>
        </View>
        <Switch value={ehModelo} onValueChange={setEhModelo} trackColor={{ false: '#1a1a1a', true: '#fff' }} thumbColor={ehModelo ? '#000' : '#333'} />
      </View>

      {/* seção de etapas */}
      <Text style={styles.label}>Etapas (opcional)</Text>

      {etapas.map((etapa, index) => (
        <View key={etapa.id} style={styles.etapaItem}>
          <View style={styles.etapaInfo}>
            <Text style={styles.etapaNumero}>{index + 1}</Text>
            <View>
              <Text style={styles.etapaTitulo}>{etapa.titulo}</Text>
              {etapa.temTimer && etapa.duracao ? (
                <Text style={styles.etapaDuracao}>⏱ {Math.floor(etapa.duracao / 60)}min{etapa.duracao % 60 > 0 ? ` ${etapa.duracao % 60}s` : ''}</Text>
              ) : (
                <Text style={styles.etapaDuracao}>✓ checkbox</Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => removerEtapa(etapa.id)}>
            <Text style={styles.etapaRemover}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.novaEtapaContainer}>
        <TextInput style={styles.inputTexto} value={novaEtapaTitulo} onChangeText={setNovaEtapaTitulo} placeholder="Título da etapa..." placeholderTextColor="#333" />
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleNome}>Etapa com timer</Text>
            <Text style={styles.toggleDesc}>Ou apenas um checkbox</Text>
          </View>
          <Switch value={novaEtapaTemTimer} onValueChange={setNovaEtapaTemTimer} trackColor={{ false: '#1a1a1a', true: '#fff' }} thumbColor={novaEtapaTemTimer ? '#000' : '#333'} />
        </View>
        {novaEtapaTemTimer && (
          <View style={styles.inputRow}>
            <TextInput style={styles.inputNumero} value={novaEtapaMinutos} onChangeText={setNovaEtapaMinutos} keyboardType="number-pad" maxLength={2} placeholder="5" placeholderTextColor="#333" />
            <Text style={styles.inputSep}>m</Text>
            <TextInput style={styles.inputNumero} value={novaEtapaSegundos} onChangeText={setNovaEtapaSegundos} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor="#333" />
            <Text style={styles.inputSep}>s</Text>
          </View>
        )}
        <TouchableOpacity style={styles.btnAdicionarEtapa} onPress={adicionarEtapa}>
          <Text style={styles.btnAdicionarEtapaTexto}>+ Adicionar etapa</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.botao, styles.botaoPrimario, { marginTop: 32, marginBottom: 60, marginHorizontal: 24 }]} onPress={handleSalvar}>
        <Text style={[styles.textoBotao, styles.textoBotaoPrimario]}>{isEditar ? 'Salvar alterações' : 'Salvar atividade'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  execContainer:          { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  execTitulo:             { fontSize: 28, fontWeight: '300', color: '#fff', textAlign: 'center', marginBottom: 8 },
  execDesc:               { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 },
  execMeta:               { fontSize: 13, color: '#444', marginBottom: 8 },
  cicloTexto:             { color: '#555', fontSize: 13, marginBottom: 16 },
  timerContainer:         { width: 280, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  timer:                  { fontSize: 64, fontWeight: '200', color: '#fff', letterSpacing: 4, position: 'absolute' },
  execControles:          { flexDirection: 'row', gap: 16, marginBottom: 32 },
  btnConcluir:            { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  btnConcluirTexto:       { color: '#fff', fontSize: 16 },
  btnVoltar:              { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, alignSelf: 'flex-start' },
  btnVoltarTexto:         { color: '#555', fontSize: 14 },
  criarContainer:         { flex: 1, backgroundColor: '#0f0f0f' },
  criarTitulo:            { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 32, paddingHorizontal: 24 },
  label:                  { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20, paddingHorizontal: 24 },
  inputTexto:             { backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginHorizontal: 24 },
  inputArea:              { height: 80, textAlignVertical: 'top' },
  toggleRow:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a', margin: 24 },
  toggleNome:             { fontSize: 15, color: '#fff', marginBottom: 2 },
  toggleDesc:             { fontSize: 12, color: '#333' },
  inputRow:               { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24 },
  inputNumero:            { width: 56, height: 48, backgroundColor: '#111', borderRadius: 8, borderWidth: 1, borderColor: '#1a1a1a', color: '#fff', fontSize: 20, textAlign: 'center' },
  inputSep:               { color: '#333', fontSize: 18 },
  tecnicas:               { flexDirection: 'row', gap: 8, paddingHorizontal: 24 },
  tecnicaBtn:             { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  tecnicaBtnAtivo:        { borderColor: '#fff', backgroundColor: '#1a1a1a' },
  tecnicaTexto:           { color: '#444', fontSize: 13 },
  tecnicaTextoAtivo:      { color: '#fff' },
  etapaItem:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#111', borderRadius: 10, marginHorizontal: 24, marginBottom: 6, borderWidth: 1, borderColor: '#1a1a1a' },
  etapaInfo:              { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  etapaNumero:            { fontSize: 12, color: '#444', width: 16 },
  etapaTitulo:            { fontSize: 14, color: '#fff', marginBottom: 2 },
  etapaDuracao:           { fontSize: 11, color: '#555' },
  etapaRemover:           { color: '#333', fontSize: 16, paddingHorizontal: 8 },
  novaEtapaContainer:     { gap: 0 },
  btnAdicionarEtapa:      { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#222', alignItems: 'center', marginHorizontal: 24, marginTop: 4 },
  btnAdicionarEtapaTexto: { color: '#555', fontSize: 13 },
  botao:                  { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  botaoPrimario:          { backgroundColor: '#fff', borderColor: '#fff' },
  textoBotao:             { color: '#888', fontSize: 16 },
  textoBotaoPrimario:     { color: '#000' },
});