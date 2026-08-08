declare const __APP_BASE_PATH__: string

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
