# FocusDrop

> Productivity app for Android — focus timer, routine management, and session history, built with React Native + Expo

![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-56-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Tests](https://img.shields.io/badge/tests-6%20passing-22c55e?style=flat-square)
![Architecture](https://img.shields.io/badge/New_Architecture-Fabric-blueviolet?style=flat-square)

---

## About

FocusDrop combines a distraction-free focus timer with a full routine management system. No accounts, no subscriptions, no noise — just structured work, tracked progress, and daily habits.

Built as a deliberate practice project applying React Native fundamentals in a real, feature-complete app targeting Google Play.

---

## Features

### Focus Timer
- **Circular progress ring** — SVG-based timer ring that depletes in real time
- **Dual mode** — Pomodoro (25 min + auto-break) or free Focus mode with no forced pause
- **Session-complete notification** — fires immediately when a focus cycle ends; displays seconds if under 1 minute of focus was recorded
- **Pause-end notification** — fires when the Pomodoro break cycle concludes, prompting the user to resume

### Routine
- **Weekly calendar** — day-by-day activity view with a 7-day selector, today highlighted
- **Scheduled start time** — assign an `HH:MM` time to any activity; the list auto-sorts by scheduled time, unscheduled items follow by creation order
- **Activity-level reminders** — a local notification is scheduled for the exact date + time when an activity is saved with a start time; cancelled automatically on edit or delete
- **Step-by-step execution** — each activity runs cycle by cycle, each step feeding its own proportional rest timer (1:5 ratio, 60 s min, 600 s max)
- **Independent step timers** — steps run one at a time; no simultaneous timers, no shared rest periods
- **Rest notification** — fires when the Rotina rest screen timer reaches zero, signalling the start of the next step
- **Template activities** — mark any activity as a model to auto-populate it on every future day
- **Persistent state** — all data survives app reload via AsyncStorage

### History
- **Grouped by day** — sessions collapsed into date headers (Hoje / Ontem / formatted weekday) with per-day focus totals
- **Resume card** — four-metric summary: total sessions, total focus time, days active, current streak
- **Streak counter** — consecutive days with at least one completed session; displays as 🔥 N, shows — on no active streak

### Statistics
- **Weekly bar chart** — sessions per day of the current week
- **Daily goal** — configurable session target with a live progress bar
- **Minutes today** — real-time total of focused minutes in the current day
- **Mood history** — weekly mood chart derived from daily check-ins

### Notifications
| Trigger | Content |
|---|---|
| Focus cycle ends | "Sessão completa!" — duration in minutes, or seconds if < 60 s |
| Pomodoro break ends | "☕ Pausa encerrada!" — prompts return to focus |
| Rotina rest ends | "✅ Descanso concluído!" — signals start of next step |
| Activity start time | "⏰ Hora de começar!" — activity title; scheduled for exact date/time |
| Daily reminder | "🎯 FocusDrop" — repeating, user-configured hour (7h–20h) |

### General
- **Mood-aware daily modal** — "Como você está hoje?" prompt on first open each day, skippable
- **Offline-first** — all data on-device, no internet required

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.85 + Expo SDK 56 |
| Architecture | New Architecture (Fabric + JSI) |
| Navigation | Expo Router v4 (file-based) |
| State | useState + useEffect + custom hooks |
| Storage | AsyncStorage |
| Notifications | expo-notifications |
| UI | React Native core + react-native-svg |
| Animations | react-native-reanimated v4 |
| Gestures | react-native-gesture-handler ~2.31 |
| Language | TypeScript |
| Tests | Jest + jest-expo |

---

## Project structure

```
focusdrop/
├── app/
│   ├── _layout.tsx              # root Stack navigator + daily reminder re-registration
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tabs navigator (icons, labels, screen list)
│   │   ├── index.tsx            # focus screen — Pomodoro / free timer
│   │   ├── rotina.tsx           # routine activity list with weekly calendar
│   │   ├── historico.tsx        # session history grouped by day + streak
│   │   ├── estatisticas.tsx     # weekly stats, daily goal, mood history
│   │   └── configuracoes.tsx    # preferences (technique, goal, daily reminder)
│   ├── descanso.tsx             # rest screen between activity steps
│   ├── atividade/[id].tsx       # create / edit / execute activity
│   └── etapa/[id].tsx           # execute an individual activity step
├── components/
│   └── ui/
│       ├── TimerRing.tsx        # SVG circular progress ring
│       └── ModalHumor.tsx       # daily mood check-in modal
├── hooks/
│   ├── useTimer.ts              # single-cycle timer (useState + useEffect)
│   └── useCycle.ts              # Pomodoro/Focus cycle orchestration
├── services/
│   ├── storage.ts               # session CRUD (AsyncStorage)
│   ├── rotina.ts                # activity CRUD, day filtering, sort by horaInicio
│   ├── notifications.ts         # all notification scheduling and cancellation
│   └── humor.ts                 # mood check-in persistence
├── constants/
│   └── keys.ts                  # AsyncStorage key constants
└── types/
    ├── session.ts               # Session interface
    └── rotina.ts                # Atividade, Etapa, Humor interfaces
```

---

## Architecture decisions

**Root Stack + nested Tabs** — `app/_layout.tsx` is a Stack navigator; the five main screens live in `app/(tabs)/`. This means `atividade/[id]`, `etapa/[id]`, and `descanso` are proper Stack screens pushed on top of the tab layer. `router.back()` reliably pops the stack and returns to the originating tab. The earlier flat-Tabs approach (hidden `href: null` screens) caused unpredictable back navigation because there was no real stack to pop from.

**Notification identifier strategy** — the daily reminder uses a fixed identifier (`lembrete_diario_focusdrop`); activity reminders use `atividade_<id>`. Cancellation is O(1) — no need to list all scheduled notifications to find the target.

**Sort-by-time in the service layer** — `buscarAtividadesDoDia` returns activities already sorted by `horaInicio`, then by `ordem`. UI components consume an ordered list; no sorting logic leaks into screens.

**Custom hooks over external libraries** — `useTimer` and `useCycle` handle all timer logic in vanilla React (~80 lines combined). No runtime dependencies, fully testable in isolation.

**Service layer per domain** — sessions, activities, notifications, and mood each have their own service file. Swapping AsyncStorage for SQLite or Supabase in the future requires touching one file per domain, not every screen.

**Single source of truth for keys** — `constants/keys.ts` centralizes all AsyncStorage key strings, eliminating the class of bug where two files reference the same key with different literals.

**`useFocusEffect` for screen-level resets** — the descanso screen fully resets its state (timer, suggestion, rest duration) every time it gains focus. This guarantees each step gets an independent, correctly proportioned rest period regardless of navigation history or Expo Router screen caching.

---

## Getting started

```bash
git clone https://github.com/samuel-lourenco25/focusdrop
cd focusdrop
npm install
npx expo start
```

Scan the QR code with Expo Go on Android or open in browser at `http://localhost:8081`.

> **Note:** Push notifications and scheduled activity reminders are silent in Expo Go (`storeClient`). Run `npx expo run:android` or create a development build for full notification support.

---

## Running tests

```bash
npx jest --verbose
```

```
PASS  __tests__/useTimer.test.ts
  useTimer
    ✓ deve iniciar com os segundos corretos
    ✓ deve mudar isRunning ao iniciar e pausar
    ✓ deve voltar ao valor inicial ao resetar

PASS  __tests__/storage.test.ts
  storage
    ✓ deve salvar e retornar a sessão
    ✓ deve acumular sessões sem perder as anteriores
    ✓ deve retornar array vazio se não houver sessões

Tests: 6 passed
```

---

## Roadmap

- [x] Dual timer mode (Pomodoro + free Focus)
- [x] Circular SVG progress ring
- [x] Routine management (create, edit, remove, execute)
- [x] Scheduled start time per activity with auto-sort
- [x] Step-by-step execution with independent timers per step
- [x] Proportional rest screen after each step
- [x] Session history grouped by day with resume card
- [x] Streak counter (consecutive active days)
- [x] Statistics screen with weekly chart and daily goal
- [x] Mood tracking (daily check-in + weekly history)
- [x] Session-complete notification (seconds shown if < 1 min)
- [x] Pause/rest-end notifications (Pomodoro + Rotina)
- [x] Activity-level scheduled reminders (auto-cancel on edit/delete)
- [x] Configurable daily reminder
- [ ] Data export (JSON backup)
- [ ] Home screen widget
- [ ] Supabase integration for cross-device sync
- [ ] Custom session categories (deep work, reading, exercise)
- [ ] Sound themes (rain, forest, café)
- [ ] Google Play release

---

## What I learned

This project was built as a deliberate practice exercise following a **learn → build → review** methodology. Each feature was written first, then explained out loud without looking at the code — a technique that retains concepts 3× more effectively than passive re-reading.

Key concepts applied in practice: `useState`, `useEffect` dependency arrays, custom hooks, async/await, service layer pattern, SVG path math, file-based routing with dynamic segments (`[id].tsx`), unit testing with mocks, root Stack + nested Tabs navigation in Expo Router, `useFocusEffect` for screen-level state resets, local notification scheduling and cancellation by identifier, and opting into React Native's New Architecture from scratch.

---

## License

MIT
