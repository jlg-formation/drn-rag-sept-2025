import { useState } from "react";
import {
  createEmbedding,
  createChatCompletion,
  type ChatMessage,
} from "./utils/openai-api";

// Types pour les chunks
type Chunk = {
  id: string;
  text: string;
  embedding: number[];
  source: string;
  position: number;
};

// Configuration du client IA (OpenAI ou LM Studio)
const apiKey =
  localStorage.getItem("OPENAI_KEY") ||
  import.meta.env.VITE_OPENAI_API_KEY ||
  "sk-fake-key-for-lm-studio";
console.log("apiKey: ", apiKey);

const baseURL =
  localStorage.getItem("OPENAI_BASE_URL") ||
  import.meta.env.VITE_OPENAI_BASE_URL;
console.log("baseURL: ", baseURL);

const embeddingModel =
  localStorage.getItem("EMBEDDING_MODEL") ||
  import.meta.env.VITE_EMBEDDING_MODEL ||
  "text-embedding-3-small";
console.log("embeddingModel: ", embeddingModel);

const chatModel =
  localStorage.getItem("CHAT_MODEL") ||
  import.meta.env.VITE_CHAT_MODEL ||
  "gpt-4o-mini";
console.log("chatModel: ", chatModel);

console.log("Configuration IA:", {
  apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "Non configurée",
  baseURL: baseURL || "Défaut (OpenAI)",
  embeddingModel,
  chatModel,
});

// Fonction pour calculer la similarité cosinus entre deux vecteurs
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fonction pour charger le vector store
async function loadVectorStore(): Promise<Chunk[]> {
  try {
    const response = await fetch("/vectorStore.json");
    if (!response.ok) {
      throw new Error("Vector store non trouvé");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement du vector store:", error);
    return [];
  }
}

// Fonction pour rechercher les chunks les plus pertinents
async function searchRelevantChunks(
  query: string,
  limit: number = 3
): Promise<Chunk[]> {
  try {
    // Générer l'embedding de la requête
    const queryEmbeddingVector = await createEmbedding(query, embeddingModel, {
      apiKey,
      baseURL,
    });

    // Charger tous les chunks
    const chunks = await loadVectorStore();

    if (chunks.length === 0) {
      console.warn("Aucun chunk trouvé dans le vector store");
      return [];
    }

    // Calculer la similarité pour chaque chunk
    const similarities = chunks.map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbeddingVector, chunk.embedding),
    }));

    // Trier par similarité décroissante et prendre les meilleurs
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, limit).map((item) => item.chunk);
  } catch (error) {
    console.error("Erreur lors de la recherche vectorielle:", error);
    return [];
  }
}

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Configuration IA
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localBaseURL, setLocalBaseURL] = useState(baseURL || "");
  const [localEmbeddingModel, setLocalEmbeddingModel] =
    useState(embeddingModel);
  const [localChatModel, setLocalChatModel] = useState(chatModel);

  const saveSettings = () => {
    localStorage.setItem("OPENAI_KEY", localApiKey);
    localStorage.setItem("OPENAI_BASE_URL", localBaseURL);
    localStorage.setItem("EMBEDDING_MODEL", localEmbeddingModel);
    localStorage.setItem("CHAT_MODEL", localChatModel);
    setShowSettings(false);
    // Recharger la page pour appliquer les nouveaux paramètres
    window.location.reload();
  };

  const ask = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    console.log("messages: ", messages);

    try {
      // 1. Rechercher les chunks pertinents avec RAG
      const relevantChunks = await searchRelevantChunks(input, 3);

      // 2. Construire le contexte à partir des chunks trouvés
      let contextText = "";
      if (relevantChunks.length > 0) {
        contextText = "Voici la documentation pertinente :\n\n";
        relevantChunks.forEach((chunk, index) => {
          contextText += `Document ${index + 1} (${chunk.source}):\n${
            chunk.text
          }\n\n`;
        });
        contextText += "---\n\n";
      } else {
        contextText =
          "Aucune documentation pertinente trouvée. Réponds avec tes connaissances générales.\n\n";
      }

      // 3. Créer le prompt système avec le contexte
      const systemPrompt = `Tu es un assistant RAG qui répond à partir de la documentation donnée.

${contextText}

Utilise UNIQUEMENT les informations fournies ci-dessus pour répondre à la question de l'utilisateur. Si la réponse n'est pas dans la documentation fournie, dis-le clairement.`;

      // 4. Appeler l'API IA avec le contexte
      const answer = await createChatCompletion(
        [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
          { role: "user", content: input },
        ],
        chatModel,
        {
          apiKey,
          baseURL,
        }
      );

      setMessages([
        ...messages,
        { role: "user", content: input },
        { role: "assistant", content: answer },
      ]);
      setInput("");
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
      setMessages([
        ...messages,
        { role: "user", content: input },
        {
          role: "assistant",
          content:
            "Désolé, une erreur s'est produite lors du traitement de votre demande.",
        },
      ]);
      setInput("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Assistant RAG</h1>
            <p className="text-sm text-gray-600 mt-1">
              Posez vos questions, je réponds avec la documentation
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Paramètres IA"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Panneau de configuration */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ⚙️ Configuration IA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de base (pour LM Studio)
                </label>
                <input
                  type="text"
                  value={localBaseURL}
                  onChange={(e) => setLocalBaseURL(e.target.value)}
                  placeholder="http://localhost:1234/v1 (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour utiliser OpenAI
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="sk-... ou lm-studio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle d'embedding
                </label>
                <input
                  type="text"
                  value={localEmbeddingModel}
                  onChange={(e) => setLocalEmbeddingModel(e.target.value)}
                  placeholder="text-embedding-3-small"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle de chat
                </label>
                <input
                  type="text"
                  value={localChatModel}
                  onChange={(e) => setLocalChatModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Commencez une conversation</p>
              <p className="text-sm">Tapez votre question ci-dessous</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        AI
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                    {m.role === "user" && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        U
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <input
                className="w-full border border-gray-300 rounded-full px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 shadow-sm"
                placeholder="Tapez votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && input.trim() && !isLoading && ask()
                }
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <button
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm ${
                input.trim() && !isLoading
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={ask}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
