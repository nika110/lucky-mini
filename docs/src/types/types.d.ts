
interface ImportMetaEnv {
  readonly VITE_APP_URL: string;
  // Добавьте другие переменные окружения здесь
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
