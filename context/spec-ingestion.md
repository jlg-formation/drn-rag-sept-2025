# 📄 Spécification technique – Script d’ingestion RAG

## 🎯 Objectif
Écrire un script séparé (Bun/TypeScript) qui prépare les données pour le système RAG :  
- Charger les documents d’un dossier fixe,  
- Les découper en chunks,  
- Générer des embeddings via OpenAI,  
- Sauvegarder le tout dans un fichier unique `vectorStore.json`.  

---

## 📂 Entrées
- Dossier fixe : `./docs/`  
- Formats supportés : `.txt`, `.md`  
- Clé OpenAI : dans un fichier `.env` sous le nom `OPENAI_API_KEY`  

---

## ⚙️ Processus

### 1. Lecture des documents
- Parcourir tous les fichiers du dossier `./docs/`.  
- Lire leur contenu brut (UTF-8).  

### 2. Découpage en chunks
- Taille cible : **500–800 caractères**.  
- Règle : couper **en fin de phrase/paragraphe** si possible, sinon couper brutalement.  
- Même les documents ou morceaux très courts (<20 caractères) sont conservés et traités.  

### 3. Génération des embeddings
- Modèle : `text-embedding-3-small`.  
- Chaque chunk est envoyé tel quel à l’API OpenAI.  
- Embedding retourné : vecteur de dimension 1536.  

### 4. Construction des objets `Chunk`
Chaque chunk est représenté par :  

```ts
type Chunk = {
  id: string;        // UUID aléatoire
  text: string;      // contenu du chunk
  embedding: number[]; // vecteur retourné par OpenAI
  source: string;    // nom du fichier d’origine
  position: number;  // ordre du chunk dans le fichier
}
```

### 5. Stockage
- Tous les chunks sont regroupés dans **un seul fichier `vectorStore.json`**.  
- À chaque exécution du script :  
  - Le fichier est **écrasé** et **entièrement régénéré**.  

---

## 📊 Sortie console
Pendant l’exécution, le script affiche :  
- Le nom de chaque fichier traité,  
- Le nombre de chunks générés,  
- Confirmation de sauvegarde finale.  

Exemple :  
```
Traitement de doc1.md → 12 chunks
Traitement de guide.txt → 7 chunks
Ingestion terminée : 19 chunks enregistrés dans vectorStore.json
```

---

## 🏗️ Organisation du projet

```
/project-root
  /docs/               # fichiers source (.txt, .md)
  /scripts/
    ingest.ts          # script d’ingestion
  /vectorStore.json    # base vectorielle générée
  .env                 # contient OPENAI_API_KEY
```
