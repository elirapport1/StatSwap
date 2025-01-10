// openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // If desired, optionally include:
  // organization: process.env.OPENAI_ORGANIZATION,
  // project: process.env.OPENAI_PROJECT_ID,
});
