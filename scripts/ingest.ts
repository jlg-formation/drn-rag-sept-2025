import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

// Types selon la spécification
type Chunk = {
  id: string;
  text: string;
  embedding: number[];
  source: string;
  position: number;
};

// Configuration
const DOCS_FOLDER = "./docs/";
const OUTPUT_FILE = "./vectorStore.json";
const CHUNK_MIN_SIZE = 500;
const CHUNK_MAX_SIZE = 800;
const SUPPORTED_EXTENSIONS = [".txt", ".md"];

// Configuration du client IA (OpenAI ou LM Studio)
const apiKey =
  process.env.VITE_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "sk-fake-key-for-lm-studio";
const baseURL = process.env.VITE_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL;
const embeddingModel =
  process.env.VITE_EMBEDDING_MODEL ||
  process.env.EMBEDDING_MODEL ||
  "text-embedding-3-small";

console.log("apiKey: ", apiKey);
console.log("baseURL: ", baseURL);
// Initialisation du client IA
const openai = new OpenAI({
  apiKey,
  baseURL,
});

/**
 * Découpe un texte en chunks selon les règles de la spécification
 */
function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];

  // Même les textes très courts (<20 caractères) sont conservés
  if (text.length <= CHUNK_MAX_SIZE) {
    chunks.push(text.trim());
    return chunks;
  }

  let currentPosition = 0;

  while (currentPosition < text.length) {
    let endPosition = Math.min(currentPosition + CHUNK_MAX_SIZE, text.length);

    // Si on n'est pas à la fin du texte, essayer de couper en fin de phrase/paragraphe
    if (endPosition < text.length) {
      // Chercher la fin de phrase la plus proche (., !, ?)
      const sentenceEnd = text.lastIndexOf(".", endPosition);
      const exclamationEnd = text.lastIndexOf("!", endPosition);
      const questionEnd = text.lastIndexOf("?", endPosition);
      const paragraphEnd = text.lastIndexOf("\n\n", endPosition);

      const bestEnd = Math.max(
        sentenceEnd,
        exclamationEnd,
        questionEnd,
        paragraphEnd
      );

      // Si on trouve une fin de phrase/paragraphe et qu'elle n'est pas trop proche du début
      if (bestEnd > currentPosition + CHUNK_MIN_SIZE) {
        endPosition = bestEnd + 1;
      }
    }

    const chunk = text.slice(currentPosition, endPosition).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    currentPosition = endPosition;
  }

  return chunks;
}

/**
 * Génère un embedding pour un chunk de texte
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Erreur lors de la génération de l'embedding:", error);
    throw error;
  }
}

/**
 * Traite un fichier et retourne ses chunks avec embeddings
 */
async function processFile(
  filePath: string,
  fileName: string
): Promise<Chunk[]> {
  console.log(`Traitement de ${fileName}...`);

  try {
    // Lecture du fichier
    const content = await readFile(filePath, "utf-8");

    // Découpage en chunks
    const textChunks = splitIntoChunks(content);

    // Génération des embeddings et création des objets Chunk
    const chunks: Chunk[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const text = textChunks[i];
      const embedding = await generateEmbedding(text);

      chunks.push({
        id: uuidv4(),
        text,
        embedding,
        source: fileName,
        position: i,
      });
    }

    console.log(`Traitement de ${fileName} → ${chunks.length} chunks`);
    return chunks;
  } catch (error) {
    console.error(`Erreur lors du traitement de ${fileName}:`, error);
    throw error;
  }
}

/**
 * Script principal d'ingestion
 */
async function main() {
  try {
    console.log("🚀 Début de l'ingestion RAG...\n");

    // Vérification de la configuration
    console.log(`Configuration IA :`);
    console.log(
      `- API Key: ${
        apiKey ? `${apiKey.substring(0, 10)}...` : "Non configurée"
      }`
    );
    console.log(`- Base URL: ${baseURL || "Défaut (OpenAI)"}`);
    console.log(`- Modèle d'embedding: ${embeddingModel}\n`);

    if (!apiKey) {
      throw new Error("Clé API manquante. Vérifiez votre fichier .env");
    }

    // Lecture du dossier docs/
    const files = await readdir(DOCS_FOLDER);
    const supportedFiles = files.filter((file) =>
      SUPPORTED_EXTENSIONS.includes(extname(file).toLowerCase())
    );

    if (supportedFiles.length === 0) {
      console.log("⚠️  Aucun fichier supporté trouvé dans ./docs/");
      return;
    }

    // Traitement de tous les fichiers
    const allChunks: Chunk[] = [];

    for (const fileName of supportedFiles) {
      const filePath = join(DOCS_FOLDER, fileName);
      const fileChunks = await processFile(filePath, fileName);
      allChunks.push(...fileChunks);
    }

    // Sauvegarde dans vectorStore.json
    await writeFile(OUTPUT_FILE, JSON.stringify(allChunks, null, 2), "utf-8");

    console.log(
      `\n✅ Ingestion terminée : ${allChunks.length} chunks enregistrés dans vectorStore.json`
    );
  } catch (error) {
    console.error("❌ Erreur lors de l'ingestion:", error);
    process.exit(1);
  }
}

// Exécution du script
if (import.meta.main) {
  main();
}
