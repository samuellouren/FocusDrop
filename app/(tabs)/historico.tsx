import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { buscarSessoes, calcularStreak } from '../../services/storage';
import { Session } from '../../types/session';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../context/ThemeContext';

type Grupo = [string, Session[]];

export default function TelaHistorico() {
  const [sessoes, setSessoes] = useState<Session[]>([]);

  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      buscarSessoes().then(setSessoes);
    }, [])
  );

  const grupos = useMemo<Grupo[]>(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessoes) {
      const chave = s.completedAt.slice(0, 10);
      if (!map.has(chave)) map.set(chave, []);
      map.get(chave)!.push(s);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessoes]);

  const streak = useMemo(() => calcularStreak(sessoes), [sessoes]);

  function formatarDia(isoDate: string): string {
    const data = new Date(isoDate + 'T12:00:00');
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
    const d = new Date(isoDate + 'T00:00:00'); d.setHours(0, 0, 0, 0);
    if (d.getTime() === hoje.getTime()) return 'Hoje';
    if (d.getTime() === ontem.getTime()) return 'Ontem';
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function formatarHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatarDuracao(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
    if (m > 0) return `${m}min${s > 0 ? ` ${s}s` : ''}`;
    return `${s}s`;
  }

  function totalDia(lista: Session[]): string {
    return formatarDuracao(lista.reduce((acc, s) => acc + s.duration, 0));
  }

  const totalGeral = useMemo(() =>
    formatarDuracao(sessoes.reduce((acc, s) => acc + s.duration, 0)),
    [sessoes]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>

      {sessoes.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Text style={styles.vazioIcon}>📋</Text>
          <Text style={styles.vazio}>Nenhuma sessão concluída ainda.</Text>
          <Text style={styles.vazioSub}>Complete uma sessão de foco para ver o histórico.</Text>
        </View>
      ) : (
        <>
          <View style={styles.resumoCard}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{sessoes.length}</Text>
              <Text style={styles.resumoLabel}>sessões</Text>
            </View>
            <View style={styles.resumoDivider} />
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{totalGeral}</Text>
              <Text style={styles.resumoLabel}>total</Text>
            </View>
            <View style={styles.resumoDivider} />
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{grupos.length}</Text>
              <Text style={styles.resumoLabel}>dias</Text>
            </View>
            <View style={styles.resumoDivider} />
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{streak > 0 ? `🔥 ${streak}` : '—'}</Text>
              <Text style={styles.resumoLabel}>sequência</Text>
            </View>
          </View>

          <FlatList
            data={grupos}
            keyExtractor={([data]) => data}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item: [data, lista] }) => (
              <View style={styles.grupo}>
                <View style={styles.grupoHeader}>
                  <Text style={styles.grupoData}>{formatarDia(data)}</Text>
                  <Text style={styles.grupoTotal}>{totalDia(lista)}</Text>
                </View>
                {lista.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.sessaoRow,
                      idx === lista.length - 1 && styles.sessaoRowUltima,
                    ]}
                  >
                    <View style={[
                      styles.badge,
                      s.tecnica === 'pomodoro' ? styles.badgePomodoro : styles.badgeFoco,
                    ]}>
                      <Text style={styles.badgeTexto}>
                        {s.tecnica === 'pomodoro' ? 'Pomodoro' : 'Foco'}
                      </Text>
                    </View>
                    <Text style={styles.sessaoDuracao}>{formatarDuracao(s.duration)}</Text>
                    <Text style={styles.sessaoHora}>{formatarHora(s.completedAt)}</Text>
                  </View>
                ))}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: t.bg, paddingTop: 60, paddingHorizontal: 24 },
    titulo:          { fontSize: 28, fontWeight: '300', color: t.textPrimary, marginBottom: 24 },

    resumoCard:      { flexDirection: 'row', backgroundColor: t.card, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 20, marginBottom: 28, justifyContent: 'space-around', alignItems: 'center' },
    resumoItem:      { alignItems: 'center' },
    resumoValor:     { fontSize: 20, fontWeight: '300', color: t.textPrimary, marginBottom: 2 },
    resumoLabel:     { fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    resumoDivider:   { width: 1, height: 32, backgroundColor: t.border },

    grupo:           { marginBottom: 24 },
    grupoHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    grupoData:       { fontSize: 12, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    grupoTotal:      { fontSize: 12, color: t.textMuted },

    sessaoRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.card, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border },
    sessaoRowUltima: { borderBottomWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },

    badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgePomodoro:   { backgroundColor: t.activeBg },
    badgeFoco:       { backgroundColor: t.activeBg },
    badgeTexto:      { fontSize: 10, color: t.textMuted, letterSpacing: 0.5 },

    sessaoDuracao:   { fontSize: 16, fontWeight: '300', color: t.textPrimary, flex: 1 },
    sessaoHora:      { fontSize: 13, color: t.textFaint },

    vazioContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -60 },
    vazioIcon:       { fontSize: 48, marginBottom: 16 },
    vazio:           { fontSize: 16, color: t.textFaint, marginBottom: 8 },
    vazioSub:        { fontSize: 13, color: t.textDimmer, textAlign: 'center' },
  });
}
