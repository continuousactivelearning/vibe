import {env} from '#root/utils/env.js';

export const llmConfig = {
  ollamaHost: env('OLLAMA_HOST'),
  ollamaPort: Number(env('OLLAMA_PORT')),
  ollamaModel: env('OLLAMA_MODEL'),
  segbotApiBaseUrl: env('SEGBOT_API_BASE_URL')
};