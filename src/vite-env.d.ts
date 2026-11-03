/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_CUSTOMER_SUPPORT_API_URL?: string;
  readonly VITE_API_KEY?: string;  
  readonly VITE_SHOW_ALL_AGENT_MESSAGES?: string;/** Dev: show tool/system/RAG messages in admin chat */
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
