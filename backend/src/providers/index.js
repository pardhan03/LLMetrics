
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GoogleProvider } from './google.js';

export const providers = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  google: new GoogleProvider(),
};