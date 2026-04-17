# PMHelper Mobile

React Native (Expo + TypeScript) companion app for the PMHelper web
dashboard. Consumes the REST API at `https://pm.digicrats.com/api`.

## Modules

Six modules covered, everything else stays web-only:

- Projects — list, detail with status tabs + tickets
- Tickets — my feed, detail with live status move + comments, create
- Daily Reports — list, form with draft/submit
- Weekly Reports — list, form with draft/submit
- Discussions — list, detail with replies
- Team directory — searchable, A–Z grouped

## Stack

- Expo SDK 54 · React Native · TypeScript
- React Navigation (native-stack + bottom-tabs)
- Axios + AsyncStorage for Sanctum bearer tokens
- Fraunces (serif display) + DM Sans (body) + JetBrains Mono
- react-native-svg for editorial charts
- expo-haptics for subtle feedback

## Run

```bash
npm install
npx expo start        # press i (iOS) or a (Android)
```

## Design

Warm editorial dark theme — off-black `#12100e`, terracotta `#e5573f`,
cream text, muted sage/amber statuses. Serif headlines, mono for codes.
