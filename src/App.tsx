import { useState, useEffect } from "react";
import OpenAI from "openai";

// Types pour les chunks
type Chunk = {
  id: string;
  text: string;
  embedding: number[];
  source: string;
  position: number;
};

const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
console.log("openaiKey: ", openaiKey);

const client = new OpenAI({
  apiKey: localStorage.getItem("OPENAI_KEY") || openaiKey,
  dangerouslyAllowBrowser: true,
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
    const queryEmbedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
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
      similarity: cosineSimilarity(
        queryEmbedding.data[0].embedding,
        chunk.embedding
      ),
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
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

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

      // 4. Appeler l'API OpenAI avec le contexte
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
          { role: "user", content: input },
        ],
      });

      const answer = res.choices[0].message?.content || "";
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
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Assistant RAG
        </h1>
        <p className="text-sm text-gray-600 text-center mt-1">
          Posez vos questions, je réponds avec la documentation
        </p>
      </div>

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
