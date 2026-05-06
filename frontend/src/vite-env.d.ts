/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YEMEKSEPETI_SEARCH_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
