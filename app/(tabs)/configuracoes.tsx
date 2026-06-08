import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { CHAVE_DURACAO_PADRAO, CHAVE_VIBRAR, CHAVE_LEMBRETE_ATIVO, CHAVE_LEMBRETE_HORA } from '../../constants/keys';
import { TECNICAS } from '../../hooks/useCycle';
import { Tecnica } from '../../types/session';
import { salvarMetaMinutos, buscarMetaMinutos } from '../../services/storage';
import { agendarLembreteDiario, cancelarLembreteDiario } from '../../services/notifications';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../context/ThemeContext';

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

const HORAS_LEMBRETE = [
  { label: '7h',  hora: 7  },
  { label: '8h',  hora: 8  },
  { label: '9h',  hora: 9  },
  { label: '12h', hora: 12 },
  { label: '18h', hora: 18 },
  { label: '20h', hora: 20 },
];

export default function TelaConfiguracoes() {
  const [tecnicaPadrao, setTecnicaPadrao] = useState<Tecnica>('pomodoro');
  const [metaMinutos, setMetaMinutos] = useState(120);
  const [vibrar, setVibrar] = useState(true);
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [lembreteHora, setLembreteHora] = useState(9);

  const { theme, modoEscuro, toggleTema } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_DURACAO_PADRAO).then(valor => {
        if (valor && valor in TECNICAS) setTecnicaPadrao(valor as Tecnica);
      });
      buscarMetaMinutos().then(setMetaMinutos);
      AsyncStorage.getItem(CHAVE_VIBRAR).then(valor => {
        if (valor !== null) setVibrar(valor === 'true');
      });
      AsyncStorage.getItem(CHAVE_LEMBRETE_ATIVO).then(valor => {
        setLembreteAtivo(valor === 'true');
      });
      AsyncStorage.getItem(CHAVE_LEMBRETE_HORA).then(valor => {
        if (valor !== null) setLembreteHora(parseInt(valor));
      });
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

  async function toggleLembrete(ativo: boolean) {
    setLembreteAtivo(ativo);
    await AsyncStorage.setItem(CHAVE_LEMBRETE_ATIVO, String(ativo));
    if (ativo) {
      await agendarLembreteDiario(lembreteHora, 0);
    } else {
      await cancelarLembreteDiario();
    }
  }

  async function salvarHoraLembrete(hora: number) {
    setLembreteHora(hora);
    await AsyncStorage.setItem(CHAVE_LEMBRETE_HORA, String(hora));
    if (lembreteAtivo) {
      await agendarLembreteDiario(hora, 0);
    }
  }

  return (
  <ScrollView style={styles.container}>
    <Text style={styles.titulo}>Configurações</Text>

    {/* aparência */}
    <Text style={styles.secao}>Aparência</Text>
    <View style={styles.toggle}>
      <View>
        <Text style={styles.toggleNome}>Modo escuro</Text>
        <Text style={styles.toggleDesc}>Alterna entre tema claro e escuro</Text>
      </View>
      <Switch
        value={modoEscuro}
        onValueChange={toggleTema}
        trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOff }}
        thumbColor={modoEscuro ? theme.btnPrimaryBg : theme.btnPrimaryBg}
      />
    </View>

    {/* técnica padrão */}
    <Text style={[styles.secao, { marginTop: 32 }]}>Técnica padrão</Text>
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
        onValueChange={v => { setVibrar(v); AsyncStorage.setItem(CHAVE_VIBRAR, String(v)); }}
        trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOff }}
        thumbColor={vibrar ? theme.btnPrimaryBg : theme.switchThumbInactive}
      />
    </View>

    {/* lembrete diário */}
    <Text style={[styles.secao, { marginTop: 32 }]}>Lembrete diário</Text>
    <View style={styles.toggle}>
      <View>
        <Text style={styles.toggleNome}>Lembrete de foco</Text>
        <Text style={styles.toggleDesc}>Notificação diária para não esquecer</Text>
      </View>
      <Switch
        value={lembreteAtivo}
        onValueChange={toggleLembrete}
        trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOff }}
        thumbColor={lembreteAtivo ? theme.btnPrimaryBg : theme.switchThumbInactive}
      />
    </View>
    {lembreteAtivo && (
      <>
        <Text style={[styles.secao, { marginTop: 16 }]}>Horário do lembrete</Text>
        <View style={styles.metaOpcoes}>
          {HORAS_LEMBRETE.map(h => (
            <TouchableOpacity
              key={h.hora}
              style={[styles.metaBtn, lembreteHora === h.hora && styles.metaBtnAtivo]}
              onPress={() => salvarHoraLembrete(h.hora)}
            >
              <Text style={[styles.metaTexto, lembreteHora === h.hora && styles.metaTextoAtivo]}>
                {h.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.dica}>
          Você receberá um lembrete todos os dias às {lembreteHora}h00
        </Text>
      </>
    )}

    {/* sobre */}
    <View style={styles.sobreDivider} />

    <Text style={styles.secao}>Sobre o FocusDrop</Text>
    <Text style={styles.sobreTexto}>
      App de foco e bem-estar criado para ajudar na quebra da procrastinação, organização da rotina e cuidado com a saúde mental — com timers inteligentes, rotina diária estruturada e acompanhamento do humor.
    </Text>

    <Text style={[styles.secao, { marginTop: 24 }]}>Desenvolvido por</Text>
    <Text style={styles.sobreTexto}>Samuel Lourenço — Engenharia de Software</Text>
    <Text style={styles.sobreDetalhe}>Papel: Desenvolvedor Full Stack</Text>
    <Text style={styles.sobreDetalhe}>Stack: React Native · Expo · TypeScript · AsyncStorage · EAS Build</Text>

    <View style={{ height: 48 }} />
  </ScrollView>
);
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container:      { flex: 1, backgroundColor: t.bg, padding: 24, paddingTop: 60 },
    titulo:         { fontSize: 28, fontWeight: '300', color: t.textPrimary, marginBottom: 32 },
    secao:          { fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    opcoes:         { gap: 8, marginBottom: 32 },
    opcao:          { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
    opcaoAtiva:     { borderColor: t.textPrimary },
    opcaoNome:      { fontSize: 15, color: t.textFaint, marginBottom: 2 },
    opcaoNomeAtivo: { color: t.textPrimary },
    opcaoDesc:      { fontSize: 12, color: t.textDimmer },
    metaOpcoes:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
    metaBtn:        { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: t.borderAccent },
    metaBtnAtivo:   { borderColor: t.textPrimary, backgroundColor: t.activeBg },
    metaTexto:      { color: t.textFaint, fontSize: 15 },
    metaTextoAtivo: { color: t.textPrimary },
    dica:           { fontSize: 12, color: t.textDimmer, marginBottom: 32 },
    toggle:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
    toggleNome:     { fontSize: 15, color: t.textPrimary, marginBottom: 2 },
    toggleDesc:     { fontSize: 12, color: t.textDimmer },
    sobreDivider:   { height: 1, backgroundColor: t.border, marginTop: 40, marginBottom: 32 },
    sobreTexto:     { fontSize: 13, color: t.textSecondary, lineHeight: 20, marginBottom: 8 },
    sobreDetalhe:   { fontSize: 12, color: t.textMuted, lineHeight: 18 },
  });
}
