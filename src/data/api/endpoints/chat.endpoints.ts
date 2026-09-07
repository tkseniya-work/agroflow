const gptApiBaseUrl = process.env.EXPO_PUBLIC_GPT_API_URL;

export const CHAT_API = {
  history: (conversationId: string) =>
    `${gptApiBaseUrl}/api/chat/history/${encodeURIComponent(conversationId)}`,
  send: `${gptApiBaseUrl}/api/chat/send`,
};

export const hasGptApiBaseUrl = Boolean(gptApiBaseUrl);
