import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { buscarAtividadesDoDia, deletarAtividade, atualizarAtividade, formatarData, diasDaSemana, aplicarModelosNoDia } from '../../services/rotina';
import { cancelarLembreteAtividade } from '../../services/notifications';
import { humorDeHoje } from '../../services/humor';
import { Atividade, Humor } from '../../types/rotina';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../context/ThemeContext';

function calcularTempoTotal(item: Atividade): string {
  if (item.etapas && item.etapas.length > 0) {
    const total = item.etapas.reduce((acc, e) => acc + (e.duracao || 0), 0);
    if (total === 0) return 'livre';
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}min${s > 0 ? ` ${s}s` : ''}`;
  }
  if (item.temTimer && item.duracao) {
    const m = Math.floor(item.duracao / 60);
    const s = item.duracao % 60;
    return `${m}min${s > 0 ? ` ${s}s` : ''}`;
  }
  return 'livre';
}

export default function TelaRotina() {
  const [diaSelecionado, setDiaSelecionado] = useState(formatarData(new Date()));
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [humor, setHumor] = useState<Humor | null>(null);
  const [atividadeExpandida, setAtividadeExpandida] = useState<string | null>(null);
  const dias = diasDaSemana();
  const hoje = formatarData(new Date());

  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      carregarAtividades(diaSelecionado);
    }, [diaSelecionado])
  );

  async function carregarAtividades(data: string) {
    console.log('[Rotina] carregarAtividades chamado para data:', data);
    await aplicarModelosNoDia(data);
    const lista = await buscarAtividadesDoDia(data);
    console.log('[Rotina] atividades encontradas:', lista.length, JSON.stringify(lista.map(a => ({ id: a.id, data: a.data, titulo: a.titulo }))));
    setAtividades(lista);
    if (data === hoje) {
      const h = await humorDeHoje();
      setHumor(h);
    } else {
      setHumor(null);
    }
  }

  async function handleLongPress(item: Atividade) {
    Alert.alert(
      item.titulo,
      'O que deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => router.push(`/atividade/${item.id}?modo=editar`) },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await cancelarLembreteAtividade(item.id);
            await deletarAtividade(item.id);
            carregarAtividades(diaSelecionado);
          },
        },
      ]
    );
  }

  async function handleConcluirEtapa(atividadeId: string, etapaId: string) {
    const ativ = atividades.find(a => a.id === atividadeId);
    if (!ativ || !ativ.etapas) return;
    const novasEtapas = ativ.etapas.map(e =>
      e.id === etapaId ? { ...e, concluida: !e.concluida } : e
    );
    const todasConcluidas = novasEtapas.every(e => e.concluida);
    await atualizarAtividade(atividadeId, {
      etapas: novasEtapas,
      ...(todasConcluidas ? { concluida: true } : {}),
    });
    carregarAtividades(diaSelecionado);
  }

  function renderConteudoCard(item: Atividade) {
    return (
      <>
        <View style={styles.atividadeCardLinha}>
          <View style={styles.atividadeInfo}>
            <View style={[styles.atividadeDot, item.concluida && styles.atividadeDotConcluida]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.atividadeTitulo, item.concluida && styles.atividadeTituloConcluido]}>
                {item.titulo}
              </Text>
              {item.descricao ? <Text style={styles.atividadeDesc}>{item.descricao}</Text> : null}
              {item.ehModelo ? <Text style={styles.modeloBadge}>🔁 modelo</Text> : null}
              {item.etapas && item.etapas.length > 0 && (
                <Text style={styles.etapasBadge}>
                  {item.etapas.filter(e => e.concluida).length}/{item.etapas.length} etapas
                </Text>
              )}
            </View>
          </View>
          <View style={styles.atividadeMeta}>
            {item.horaInicio && <Text style={styles.atividadeHora}>{item.horaInicio}</Text>}
            <Text style={styles.atividadeDuracao}>{calcularTempoTotal(item)}</Text>
            {item.concluida && <Text style={styles.check}>✓</Text>}
            {item.etapas && item.etapas.length > 0 && !item.concluida && (
              <Text style={styles.expandirIcon}>
                {atividadeExpandida === item.id ? '▲' : '▼'}
              </Text>
            )}
          </View>
        </View>

        {atividadeExpandida === item.id && item.etapas && (
          <View style={styles.etapasContainer}>
            {item.etapas.map(etapa => (
              <TouchableOpacity
                key={etapa.id}
                style={styles.etapaRow}
                onPress={() => {
                  if (etapa.concluida) {
                    handleConcluirEtapa(item.id, etapa.id);
                  } else if (etapa.temTimer) {
                    router.push(`/etapa/${etapa.id}?atividadeId=${item.id}`);
                  } else {
                    handleConcluirEtapa(item.id, etapa.id);
                  }
                }}
              >
                <View style={[styles.etapaCheck, etapa.concluida && styles.etapaCheckConcluida]}>
                  {etapa.concluida && <Text style={styles.etapaCheckTexto}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.etapaTexto, etapa.concluida && styles.etapaTextoConcluido]}>
                    {etapa.titulo}
                  </Text>
                  {etapa.temTimer && etapa.duracao ? (
                    <Text style={styles.etapaTempoTexto}>
                      ⏱ {Math.floor(etapa.duracao / 60)}min
                      {etapa.duracao % 60 > 0 ? ` ${etapa.duracao % 60}s` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.etapaTempoTexto}>toque para concluir</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.etapaIniciarBtn}
              onPress={() => router.push(`/atividade/${item.id}`)}
            >
              <Text style={styles.etapaIniciarTexto}>Iniciar atividade completa →</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }

  function handlePressCard(item: Atividade) {
    if (item.concluida) return;
    if (item.etapas && item.etapas.length > 0) {
      setAtividadeExpandida(prev => prev === item.id ? null : item.id);
    } else {
      router.push(`/atividade/${item.id}`);
    }
  }

  const renderItemWeb = ({ item }: { item: Atividade }) => (
    <TouchableOpacity
      style={[
        styles.atividadeCard,
        item.concluida && styles.atividadeCardConcluida,
        atividadeExpandida === item.id && styles.atividadeCardExpandido,
      ]}
      onPress={() => handlePressCard(item)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={400}
    >
      {renderConteudoCard(item)}
    </TouchableOpacity>
  );

  const atividadesPendentes = atividades.filter(a => !a.concluida);
  const atividadesConcluidas = atividades.filter(a => a.concluida);
  const listaData = [...atividadesPendentes, ...atividadesConcluidas];

  return (
    <View style={styles.container}>
        <Text style={styles.titulo}>Rotina</Text>

        <View style={styles.calendario}>
          {dias.map(dia => (
            <TouchableOpacity
              key={dia.data}
              style={[styles.diaBtn, diaSelecionado === dia.data && styles.diaBtnAtivo, dia.data === hoje && styles.diaBtnHoje]}
              onPress={() => setDiaSelecionado(dia.data)}
            >
              <Text style={[styles.diaSemana, diaSelecionado === dia.data && styles.diaTextoAtivo]}>{dia.diaSemana}</Text>
              <Text style={[styles.diaNumero, diaSelecionado === dia.data && styles.diaTextoAtivo]}>{dia.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {humor && (
          <View style={styles.humorCard}>
            <Text style={styles.humorEmoji}>{humor.emoji}</Text>
            <View>
              <Text style={styles.humorLabel}>Humor de hoje</Text>
              <Text style={styles.humorTexto}>{humor.label}</Text>
            </View>
          </View>
        )}

        {atividadesConcluidas.length > 0 && (
          <Text style={styles.secaoLabel}>{atividadesConcluidas.length} concluída(s)</Text>
        )}

        <FlatList
          data={listaData}
          keyExtractor={item => item.id}
          renderItem={renderItemWeb}
          style={{ flex: 1 }}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma atividade para este dia.{'\n'}Toque em + para adicionar.</Text>
          }
        />

        <TouchableOpacity
          style={styles.btnAdicionar}
          onPress={() => router.push(`/atividade/nova?data=${diaSelecionado}&ordem=${atividades.length}`)}
        >
          <Text style={styles.btnAdicionarTexto}>+</Text>
        </TouchableOpacity>
      </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container:               { flex: 1, backgroundColor: t.bg, paddingTop: 60 },
    titulo:                  { fontSize: 28, fontWeight: '300', color: t.textPrimary, marginBottom: 24, paddingHorizontal: 24 },
    calendario:              { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
    diaBtn:                  { alignItems: 'center', padding: 8, borderRadius: 12, minWidth: 40 },
    diaBtnAtivo:             { backgroundColor: t.btnPrimaryBg },
    diaBtnHoje:              { borderWidth: 1, borderColor: t.borderStrong },
    diaSemana:               { fontSize: 10, color: t.textMuted, marginBottom: 4 },
    diaNumero:               { fontSize: 16, color: t.textPrimary, fontWeight: '300' },
    diaTextoAtivo:           { color: t.btnPrimaryText },
    humorCard:               { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, marginBottom: 16 },
    humorEmoji:              { fontSize: 24 },
    humorLabel:              { fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    humorTexto:              { fontSize: 14, color: t.textPrimary },
    lista:                   { paddingHorizontal: 24, paddingBottom: 100 },
    vazio:                   { color: t.textDimmer, fontSize: 14, textAlign: 'center', marginTop: 60, lineHeight: 24 },
    secaoLabel:              { fontSize: 11, color: t.textDimmer, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 8, paddingHorizontal: 24 },
    atividadeCard:           { padding: 16, backgroundColor: t.card, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: t.border },
    atividadeCardConcluida:  { opacity: 0.4 },
    atividadeCardExpandido:  { borderColor: t.borderStrong },
    atividadeCardLinha:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    atividadeInfo:           { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    atividadeDot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: t.textPrimary },
    atividadeDotConcluida:   { backgroundColor: t.textDimmer },
    atividadeTitulo:         { fontSize: 15, color: t.textPrimary, marginBottom: 2 },
    atividadeTituloConcluido:{ textDecorationLine: 'line-through', color: t.textFaint },
    atividadeDesc:           { fontSize: 12, color: t.textMuted },
    modeloBadge:             { fontSize: 10, color: t.textFaint, marginTop: 2 },
    etapasBadge:             { fontSize: 10, color: t.textMuted, marginTop: 2 },
    atividadeMeta:           { alignItems: 'flex-end', gap: 4 },
    atividadeHora:           { fontSize: 13, color: t.textSecondary, fontWeight: '300', letterSpacing: 0.5 },
    atividadeDuracao:        { fontSize: 12, color: t.textFaint },
    check:                   { fontSize: 14, color: t.textMuted },
    expandirIcon:            { fontSize: 10, color: t.textFaint },
    etapasContainer:         { marginTop: 12, borderTopWidth: 1, borderTopColor: t.border, paddingTop: 12 },
    etapaRow:                { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    etapaCheck:              { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: t.borderStrong, alignItems: 'center', justifyContent: 'center' },
    etapaCheckConcluida:     { backgroundColor: t.btnPrimaryBg, borderColor: t.btnPrimaryBg },
    etapaCheckTexto:         { fontSize: 12, color: t.btnPrimaryText },
    etapaTexto:              { fontSize: 13, color: t.textPrimary },
    etapaTextoConcluido:     { textDecorationLine: 'line-through', color: t.textFaint },
    etapaTempoTexto:         { fontSize: 11, color: t.textMuted, marginTop: 2 },
    etapaIniciarBtn:         { marginTop: 8, paddingVertical: 8, alignItems: 'center' },
    etapaIniciarTexto:       { color: t.textMuted, fontSize: 13 },
    btnAdicionar:            { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: t.btnPrimaryBg, alignItems: 'center', justifyContent: 'center' },
    btnAdicionarTexto:       { fontSize: 28, color: t.btnPrimaryText, lineHeight: 32 },
  });
}
