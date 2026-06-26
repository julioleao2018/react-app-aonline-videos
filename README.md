# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Backend / API

O app consome a API somente-leitura do backend Laravel (`/api/v1`), com auth por
token Sanctum (Bearer). **Toda navegação exige login** (mesmo usuário do site) —
não há catálogo anônimo.

A URL base da API vem de `expo.extra.apiBaseUrl` em [app.json](app.json):

- **Produção (padrão):** `https://animesbr.lat/api/v1` — só funciona depois que o
  backend com a API estiver deployado na VPS.
- **Dev contra o backend local em Docker** (porta 8000): ajuste `apiBaseUrl`:
  - Emulador Android: `http://10.0.2.2:8000/api/v1`
  - iOS simulator: `http://localhost:8000/api/v1`
  - Device físico (Expo Go): `http://<IP-da-sua-máquina-na-LAN>:8000/api/v1`

Arquitetura (Clean-ish): `src/config` (env) · `src/data/api` (axios + Bearer) ·
`src/data/auth` (token no SecureStore, login) · `src/data/repositories` (chamadas
à API) · `src/domain/models` (tipos). Sessão e gate de login em
[hooks/useAuth.tsx](hooks/useAuth.tsx).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
