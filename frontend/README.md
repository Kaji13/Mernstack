# React + Vite

## Production API configuration

Vite embeds frontend environment variables at build time. Set `VITE_API_URL` in the frontend hosting provider to the deployed backend origin (for example, `https://api.example.com`). The client adds `/api` automatically, so a value that already ends in `/api` also works. Rebuild and redeploy the frontend after changing it.

Realtime chat and notifications use the same backend origin by default. Set `VITE_SOCKET_URL` only if Socket.IO is hosted at a different origin. Configure the backend `CLIENT_URL` to the frontend's deployed origin so API and socket requests are accepted.

See `.env.production.example` for the expected variables.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
