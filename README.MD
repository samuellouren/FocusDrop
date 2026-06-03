# FocusDrop

> Minimalist focus timer for Android — built with React Native + Expo

![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-56-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)
![Tests](https://img.shields.io/badge/tests-6%20passing-22c55e?style=flat-square)

---

## About

FocusDrop is a distraction-free focus timer with session history and persistent preferences. No accounts, no subscriptions, no noise — just you and the clock.

Built as a learning project to apply React Native fundamentals in a real, publishable app.

---

## Features

- **Circular progress ring** — SVG-based timer ring that depletes in real time
- **Session history** — every completed session is saved locally and shown in a timeline
- **Persistent preferences** — default duration is remembered between sessions
- **Auto-reset** — timer resets automatically 2 seconds after completion
- **Push notifications** — notifies when session completes, even with screen locked
- **Weekly statistics** — bar chart showing sessions per day of the week
- **Daily goal** — set a target number of sessions per day with a progress bar
- **Streak** — tracks consecutive days with at least one completed session
- **Offline-first** — all data lives on device via AsyncStorage, no internet required

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Navigation | Expo Router (file-based) |
| State | useState + useEffect (no external library) |
| Storage | AsyncStorage |
| UI | React Native core + react-native-svg |
| Language | TypeScript |
| Tests | Jest + jest-expo |

---

## Project structure

```
focusdrop/
├── app/                  # screens (Expo Router)
│   ├── _layout.tsx       # tab navigation
│   ├── index.tsx         # focus screen
│   ├── historico.tsx     # session history
│   └── configuracoes.tsx # preferences
├── components/
│   └── ui/
│       └── TimerRing.tsx # SVG progress ring
├── hooks/
│   └── useTimer.ts       # timer logic (useState + useEffect)
├── services/
│   └── storage.ts        # AsyncStorage abstraction
├── constants/
│   └── keys.ts           # storage key constants
└── types/
    └── session.ts        # TypeScript interfaces
```

---

## Architecture decisions

**Custom hook over external library** — `useTimer` is ~40 lines of vanilla React. No dependencies, fully testable, easy to extend.

**Service layer for storage** — `services/storage.ts` abstracts AsyncStorage so swapping to Supabase or SQLite in the future requires changing one file, not every screen.

**Single source of truth for keys** — `constants/keys.ts` centralizes all AsyncStorage keys, eliminating the class of bug where two files reference the same key by different string literals.

**File-based routing** — Expo Router keeps navigation declarative and co-located with the screens themselves.

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
- [ ] Supabase integration for cross-device sync
- [ ] Custom session categories (deep work, reading, exercise)
- [ ] Sound themes (rain, forest, café)
- [ ] Home screen widget
- [ ] Google Play release
---

## What I learned

This project was built as a deliberate practice exercise following a **learn → build → review** methodology. Each feature was written first, then explained out loud without looking at the code — a technique that retains concepts 3× more effectively than passive re-reading.

Key concepts applied in practice: `useState`, `useEffect` dependency arrays, custom hooks, async/await, service layer pattern, SVG path math, file-based routing, unit testing with mocks, and EAS Build for Android.

---

## License

MIT