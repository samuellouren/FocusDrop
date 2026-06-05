import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, FlatList } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { buscarAtividadesDoDia, deletarAtividade, atualizarAtividade, formatarData, diasDaSemana, aplicarModelosNoDia } from '../services/rotina';
import { humorDeHoje } from '../services/humor';
import { Atividade, Humor } from '../types/rotina';

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

  useFocusEffect(
    useCallback(() => {
      carregarAtividades(diaSelecionado);
    }, [diaSelecionado])
  );

  async function carregarAtividades(data: string) {
    await aplicarModelosNoDia(data);
    const lista = await buscarAtividadesDoDia(data);
    setAtividades(lista);
    if (data === hoje) {
      const h = await humorDeHoje();
      setHumor(h);
    } else {
      setHumor(null);
    }
  }

  async function handleReordenar(novaOrdem: Atividade[]) {
    const atualizadas = novaOrdem.map((a, i) => ({ ...a, ordem: i }));
    setAtividades(atualizadas);
    for (const a of atualizadas) {
      await atualizarAtividade(a.id, { ordem: a.ordem });
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
    await atualizarAtividade(atividadeId, { etapas: novasEtapas });
    carregarAtividades(diaSelecionado);
  }

  function renderConteudoCard(item: Atividade) {
    return (
      <>
        <View style={styles.atividadeCardLinha}>
          <View style={styles.atividadeInfo}>
            {!item.concluida && Platform.OS !== 'web' && (
              <Text style={styles.dragHandle}>⠿</Text>
            )}
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

  // renderItem para DraggableFlatList (nativo)
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Atividade>) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[
          styles.atividadeCard,
          item.concluida && styles.atividadeCardConcluida,
          isActive && styles.atividadeCardArrastando,
          atividadeExpandida === item.id && styles.atividadeCardExpandido,
        ]}
        onPress={() => handlePressCard(item)}
        onLongPress={() => item.concluida ? handleLongPress(item) : drag()}
        delayLongPress={200}
      >
        {renderConteudoCard(item)}
      </TouchableOpacity>
    </ScaleDecorator>
  );

  // renderItem para FlatList (web)
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        {Platform.OS === 'web' ? (
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
        ) : (
          <DraggableFlatList
            data={listaData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => handleReordenar(data)}
            style={{ flex: 1 }}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.vazio}>Nenhuma atividade para este dia.{'\n'}Toque em + para adicionar.</Text>
            }
          />
        )}

        <TouchableOpacity
          style={styles.btnAdicionar}
          onPress={() => router.push(`/atividade/nova?data=${diaSelecionado}&ordem=${atividades.length}`)}
        >
          <Text style={styles.btnAdicionarTexto}>+</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:               { flex: 1, backgroundColor: '#0f0f0f', paddingTop: 60 },
  titulo:                  { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 24, paddingHorizontal: 24 },
  calendario:              { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  diaBtn:                  { alignItems: 'center', padding: 8, borderRadius: 12, minWidth: 40 },
  diaBtnAtivo:             { backgroundColor: '#fff' },
  diaBtnHoje:              { borderWidth: 1, borderColor: '#333' },
  diaSemana:               { fontSize: 10, color: '#555', marginBottom: 4 },
  diaNumero:               { fontSize: 16, color: '#fff', fontWeight: '300' },
  diaTextoAtivo:           { color: '#000' },
  humorCard:               { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, marginBottom: 16 },
  humorEmoji:              { fontSize: 24 },
  humorLabel:              { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 },
  humorTexto:              { fontSize: 14, color: '#fff' },
  lista:                   { paddingHorizontal: 24, paddingBottom: 100 },
  vazio:                   { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 60, lineHeight: 24 },
  secaoLabel:              { fontSize: 11, color: '#333', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 8, paddingHorizontal: 24 },
  atividadeCard:           { padding: 16, backgroundColor: '#111', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1a1a1a' },
  atividadeCardConcluida:  { opacity: 0.4 },
  atividadeCardArrastando: { backgroundColor: '#1a1a1a', borderColor: '#333', opacity: 0.9 },
  atividadeCardExpandido:  { borderColor: '#333' },
  atividadeCardLinha:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  atividadeInfo:           { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dragHandle:              { color: '#333', fontSize: 16, marginRight: 2 },
  atividadeDot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  atividadeDotConcluida:   { backgroundColor: '#333' },
  atividadeTitulo:         { fontSize: 15, color: '#fff', marginBottom: 2 },
  atividadeTituloConcluido:{ textDecorationLine: 'line-through', color: '#444' },
  atividadeDesc:           { fontSize: 12, color: '#555' },
  modeloBadge:             { fontSize: 10, color: '#444', marginTop: 2 },
  etapasBadge:             { fontSize: 10, color: '#555', marginTop: 2 },
  atividadeMeta:           { alignItems: 'flex-end', gap: 4 },
  atividadeDuracao:        { fontSize: 12, color: '#444' },
  check:                   { fontSize: 14, color: '#555' },
  expandirIcon:            { fontSize: 10, color: '#444' },
  etapasContainer:         { marginTop: 12, borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 12 },
  etapaRow:                { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  etapaCheck:              { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  etapaCheckConcluida:     { backgroundColor: '#fff', borderColor: '#fff' },
  etapaCheckTexto:         { fontSize: 12, color: '#000' },
  etapaTexto:              { fontSize: 13, color: '#fff' },
  etapaTextoConcluido:     { textDecorationLine: 'line-through', color: '#444' },
  etapaTempoTexto:         { fontSize: 11, color: '#555', marginTop: 2 },
  etapaIniciarBtn:         { marginTop: 8, paddingVertical: 8, alignItems: 'center' },
  etapaIniciarTexto:       { color: '#555', fontSize: 13 },
  btnAdicionar:            { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  btnAdicionarTexto:       { fontSize: 28, color: '#000', lineHeight: 32 },
});