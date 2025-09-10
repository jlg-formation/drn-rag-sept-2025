// Types pour les réponses de l'API OpenAI
export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Configuration de l'API
export interface ApiConfig {
  apiKey: string;
  baseURL?: string;
}

/**
 * Génère un embedding pour un texte donné
 */
export async function createEmbedding(
  text: string,
  model: string,
  config: ApiConfig
): Promise<number[]> {
  // Construire l'URL en évitant la duplication de /v1
  let url = config.baseURL || "https://api.openai.com";
  if (!url.endsWith("/v1")) {
    url += "/v1";
  }
  url += "/embeddings";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: model,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API (${response.status}): ${errorText}`);
  }

  const rawData = await response.json();

  // Vérifier si la structure correspond à OpenAI
  if (rawData.data && rawData.data[0] && rawData.data[0].embedding) {
    return rawData.data[0].embedding;
  }
  // Structure alternative pour LM Studio ou autres APIs
  else if (rawData.embedding && Array.isArray(rawData.embedding)) {
    return rawData.embedding;
  } else {
    throw new Error(
      `Structure de réponse inattendue: ${JSON.stringify(rawData)}`
    );
  }
}

/**
 * Crée une completion de chat
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  model: string,
  config: ApiConfig
): Promise<string> {
  // Construire l'URL en évitant la duplication de /v1
  let url = config.baseURL || "https://api.openai.com";
  if (!url.endsWith("/v1")) {
    url += "/v1";
  }
  url += "/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API (${response.status}): ${errorText}`);
  }

  const rawData = await response.json();

  // Vérifier si la structure correspond à OpenAI
  if (rawData.choices && rawData.choices[0] && rawData.choices[0].message) {
    return rawData.choices[0].message.content || "";
  }
  // Structure alternative pour LM Studio ou autres APIs
  else if (rawData.content) {
    return rawData.content;
  } else if (rawData.response) {
    return rawData.response;
  } else {
    throw new Error(
      `Structure de réponse inattendue: ${JSON.stringify(rawData)}`
    );
  }
}
