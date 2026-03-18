/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_VAPI_PUBLIC_KEY: string
  readonly VITE_VAPI_PRIVATE_KEY: string
  readonly VITE_GCP_PROJECT_ID: string
  readonly VITE_ENABLE_VOICE_AI: string
  readonly VITE_ENABLE_VERTEX_AI: string
  readonly VITE_ENABLE_CLOUD_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}