# FocusDrop

> Productivity app for Android — focus timer, routine management, and weekly stats, built with React Native + Expo

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
- **Push notifications** — notifies on session completion, even with screen locked
- **Auto-reset** — timer resets automatically 2 seconds after completion

### Routine
- **Activity list** — create, edit, and remove activities with long-press context menu
- **Step-by-step execution** — each activity runs cycle by cycle with a dedicated rest screen
- **Optional timed steps** — individual activity steps can have their own timer
- **Persistent state** — completion count survives app reload via AsyncStorage

### Statistics & Tracking
- **Weekly bar chart** — sessions per day of the week
- **Daily goal** — set a session target with a live progress bar
- **Streak counter** — tracks consecutive days with at least one completed session
- **Minutes today** — real-time total of focused minutes in the current day
- **Mood tracking** — daily mood check-in (shown on first open) with weekly mood history

### General
- **Session history** — every completed session logged with date, time, and duration
- **Offline-first** — all data on-device via AsyncStorage, no internet required
- **Mood-aware daily modal** — "How are you today?" prompt with option to skip

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.85 + Expo SDK 56 |
| Architecture | New Architecture (Fabric + JSI) |
| Navigation | Expo Router v4 (file-based) |
| State | useState + useEffect + custom hooks |
| Storage | AsyncStorage |
| UI | React Native core + react-native-svg |
| Animations | react-native-reanimated v4 |
| Gestures | react-native-gesture-handler ~2.31 |
| Language | TypeScript |
| Tests | Jest + jest-expo |

---

## Project structure

```
focusdrop/
├── app/                      # screens (Expo Router)
│   ├── _layout.tsx           # tab navigation + GestureHandlerRootView
│   ├── index.tsx             # focus screen (Pomodoro / free timer)
│   ├── rotina.tsx            # routine activity list
│   ├── historico.tsx         # session history timeline
│   ├── estatisticas.tsx      # weekly stats, streak, mood history
│   ├── configuracoes.tsx     # preferences (technique, goal, vibration)
│   ├── descanso.tsx          # rest screen between activity cycles
│   ├── atividade/[id].tsx    # create / edit activity
│   └── etapa/[id].tsx        # create / edit activity step
├── components/
│   └── ui/
│       └── TimerRing.tsx     # SVG progress ring
├── hooks/
│   └── useTimer.ts           # timer logic (useState + useEffect)
├── services/
│   └── storage.ts            # AsyncStorage abstraction
├── constants/
│   └── keys.ts               # storage key constants
└── types/
    └── session.ts            # TypeScript interfaces
```

---

## Architecture decisions

**Custom hook over external library** — `useTimer` is ~40 lines of vanilla React. No dependencies, fully testable, easy to extend.

**Service layer for storage** — `services/storage.ts` abstracts AsyncStorage so swapping to Supabase or SQLite in the future requires changing one file, not every screen.

**Single source of truth for keys** — `constants/keys.ts` centralizes all AsyncStorage keys, eliminating the class of bug where two files reference the same key with different string literals.

**File-based routing** — Expo Router keeps navigation declarative and co-located with the screens themselves.

**New Architecture (Fabric)** — opted in from the start to be forward-compatible with React Native's default from 0.76+. Required resolving `react-native-reanimated` v4 compatibility manually (replaced `DraggableFlatList` which bundles v3 worklets).

---

## Getting started

```bash
git clone https://github.com/samuel-lourenco25/focusdrop
cd focusdrop
npm install
npx expo start
```

Scan the QR code with Expo Go on Android or open in browser at `http://localhost:8081`.

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

- [x] Push notifications when session completes
- [x] Statistics screen with weekly chart
- [x] Daily goal with progress tracking
- [x] Streak counter
- [x] Routine management (create, edit, remove, execute activities)
- [x] Step-by-step activity execution with rest screen
- [x] Mood tracking (daily check-in + weekly history)
- [x] Dual timer mode (Pomodoro + free Focus)
- [ ] Supabase integration for cross-device sync
- [ ] Custom session categories (deep work, reading, exercise)
- [ ] Sound themes (rain, forest, café)
- [ ] Home screen widget
- [ ] Google Play release

---

## What I learned

This project was built as a deliberate practice exercise following a **learn → build → review** methodology. Each feature was written first, then explained out loud without looking at the code — a technique that retains concepts 3× more effectively than passive re-reading.

Key concepts applied in practice: `useState`, `useEffect` dependency arrays, custom hooks, async/await, service layer pattern, SVG path math, file-based routing with dynamic segments (`[id].tsx`), unit testing with mocks, Expo Router navigation between tabs and modals, and opting into React Native's New Architecture from scratch.

---

## License

MIT
