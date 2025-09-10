# 🤖 RAG Chat - Assistant IA avec Recherche Vectorielle

Un système de chat intelligent qui utilise la technologie RAG (Retrieval-Augmented Generation) pour répondre aux questions en se basant sur votre documentation locale.

## 📋 Fonctionnalités

- 💬 **Interface de chat moderne** avec React et TailwindCSS
- 🔍 **Recherche vectorielle** pour trouver les informations pertinentes
- 📚 **Ingestion automatique** de documents (`.txt`, `.md`)
- 🧠 **Réponses contextualisées** grâce à OpenAI GPT-4 ou **IA locale via LM Studio**
- ⚙️ **Configuration flexible** : OpenAI ou modèles locaux
- ⚡ **Performance optimale** avec Vite et TypeScript

---

## 🛠️ Prérequis

### Système d'exploitation

- **Windows 10/11** ou **Linux** (Ubuntu, Debian, etc.)

### Logiciels requis

#### Option 1 : Bun (Recommandé)

1. **Installer Bun** :

   **Sur Windows :**

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

   **Sur Linux :**

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

#### Option 2 : Node.js (Alternative)

1. **Installer Node.js** (version 18 ou supérieure) :
   - Télécharger depuis [nodejs.org](https://nodejs.org/)
   - Ou utiliser un gestionnaire de versions comme `nvm`

### IA et Modèles

Vous avez **deux options** pour faire fonctionner l'application :

#### Option A : OpenAI (Cloud)

- Créer un compte sur [OpenAI](https://platform.openai.com/)
- Générer une clé API dans les paramètres

#### Option B : LM Studio (Local)

- Télécharger [LM Studio](https://lmstudio.ai/)
- Télécharger un modèle compatible (ex: Llama, Mistral, etc.)
- Lancer le serveur local sur le port 1234

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd rag-chat
```

### 2. Installer les dépendances

**Avec Bun (recommandé) :**

```bash
bun install
```

**Avec npm :**

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

#### Pour OpenAI (Cloud)

**Sur Windows :**

```powershell
copy .env.example .env
```

**Sur Linux :**

```bash
cp .env.example .env
```

Puis éditez le fichier `.env` et configurez :

```env
VITE_OPENAI_API_KEY=sk-votre_cle_openai_ici
```

#### Pour LM Studio (Local)

Éditez le fichier `.env` avec :

```env
VITE_OPENAI_API_KEY=lm-studio
VITE_OPENAI_BASE_URL=http://localhost:1234/v1
VITE_EMBEDDING_MODEL=nomic-embed-text  # ou un autre modèle d'embedding
VITE_CHAT_MODEL=llama-3.1-8b-instruct  # ou votre modèle préféré
```

> **Note :** Vous pouvez aussi configurer ces paramètres directement dans l'interface web via le bouton ⚙️

### 4. Préparer la documentation

Le dossier `docs/` contient déjà quelques fichiers d'exemple. Vous pouvez :

- Ajouter vos propres fichiers `.txt` ou `.md` dans le dossier `docs/`
- Modifier les fichiers existants selon vos besoins

---

## 📖 Utilisation

### 1. Ingestion des documents

Avant de démarrer l'application, vous devez traiter vos documents pour créer la base vectorielle.

> **Important pour LM Studio :** Assurez-vous que LM Studio est lancé avec un modèle d'embedding chargé avant de lancer l'ingestion.

**Avec Bun :**

```bash
bun run ingest
```

**Avec npm :**

```bash
npm run ingest
```

Cette commande va :

- Lire tous les fichiers `.txt` et `.md` du dossier `docs/`
- Les découper en chunks intelligents
- Générer des embeddings avec OpenAI ou LM Studio
- Créer le fichier `vectorStore.json`

**Exemple de sortie :**

```
🚀 Début de l'ingestion RAG...

Configuration IA :
- API Key: lm-studio...
- Base URL: http://localhost:1234/v1
- Modèle d'embedding: nomic-embed-text

Traitement de faq.md → 8 chunks
Traitement de guide.md → 12 chunks
Traitement de config.txt → 3 chunks

✅ Ingestion terminée : 23 chunks enregistrés dans vectorStore.json
```

### 2. Démarrer l'application

**Avec Bun :**

```bash
bun run dev
```

**Avec npm :**

```bash
npm run dev
```

L'application sera accessible à l'adresse : http://localhost:5173

### 3. Utiliser l'interface

1. Ouvrez votre navigateur sur http://localhost:5173
2. **Configurez l'IA** (optionnel) :
   - Cliquez sur le bouton ⚙️ en haut à droite
   - Configurez l'URL de base pour LM Studio : `http://localhost:1234/v1`
   - Configurez la clé API : `lm-studio` pour LM Studio ou votre clé OpenAI
   - Configurez les modèles selon votre setup
   - Cliquez sur "Sauvegarder"
3. Tapez votre question dans le champ de saisie
4. L'assistant recherchera dans vos documents et répondra avec le contexte approprié

**Configuration recommandée pour LM Studio :**

- URL de base : `http://localhost:1234/v1`
- Clé API : `lm-studio`
- Modèle d'embedding : `nomic-embed-text` (ou celui chargé dans LM Studio)
- Modèle de chat : `llama-3.1-8b-instruct` (ou votre modèle préféré)

---

## 🔧 Scripts disponibles

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `bun run dev`     | Lance le serveur de développement        |
| `bun run build`   | Compile l'application pour la production |
| `bun run preview` | Prévisualise la version compilée         |
| `bun run ingest`  | Lance l'ingestion des documents          |
| `bun run lint`    | Vérifie la qualité du code               |

---

## 📁 Structure du projet

```
rag-chat/
├── docs/                   # 📚 Vos documents source
│   ├── faq.md
│   ├── guide.md
│   └── config.txt
├── scripts/
│   └── ingest.ts          # 🔄 Script d'ingestion
├── src/
│   ├── App.tsx            # 🏠 Interface principale
│   ├── main.tsx
│   └── assets/
├── public/
├── vectorStore.json       # 🗂️ Base vectorielle (généré)
├── .env                   # 🔑 Clés API et configuration
├── .env.example           # 📋 Exemple de configuration
├── package.json
└── README.md
```

---

## 🛠️ Dépannage

### Problème : "Vector store non trouvé"

**Solution :** Exécutez d'abord la commande d'ingestion :

```bash
bun run ingest
```

### Problème : "Clé API manquante"

**Solution :** Vérifiez votre fichier `.env` :

1. Le fichier existe à la racine du projet
2. La variable est bien nommée `VITE_OPENAI_API_KEY`
3. La clé API est valide

**Pour LM Studio :** La clé peut être `lm-studio` et vous devez aussi configurer `VITE_OPENAI_BASE_URL=http://localhost:1234/v1`

### Problème : "Erreur de connexion avec LM Studio"

**Solution :**

1. Vérifiez que LM Studio est bien lancé sur le port 1234
2. Vérifiez qu'un modèle est chargé dans LM Studio
3. Testez l'endpoint : `curl http://localhost:1234/v1/models`
4. Vérifiez que l'URL de base est bien configurée : `http://localhost:1234/v1`

### Problème : Erreur de compilation TypeScript

**Solution :** Vérifiez la version de TypeScript :

```bash
bun --version  # ou npm --version
```

### Problème : Port déjà utilisé

**Solution :** Le port 5173 est peut-être occupé. Vite choisira automatiquement un autre port ou vous pouvez spécifier :

```bash
bun run dev -- --port 3000
```

---

## 🖥️ Configuration LM Studio (IA Locale)

### Installation et configuration de LM Studio

1. **Télécharger LM Studio** : [https://lmstudio.ai/](https://lmstudio.ai/)

2. **Télécharger des modèles** :

   - **Pour le chat** : Llama 3.1 8B, Mistral 7B, ou tout autre modèle compatible
   - **Pour les embeddings** : nomic-embed-text ou sentence-transformers

3. **Lancer le serveur** :

   - Ouvrez LM Studio
   - Allez dans l'onglet "Local Server"
   - Chargez votre modèle de chat
   - Cliquez sur "Start Server" (par défaut sur le port 1234)

4. **Configuration dans l'app** :
   ```env
   VITE_OPENAI_API_KEY=lm-studio
   VITE_OPENAI_BASE_URL=http://localhost:1234/v1
   VITE_CHAT_MODEL=votre-modele-charge
   VITE_EMBEDDING_MODEL=nomic-embed-text
   ```

### Avantages de LM Studio

- ✅ **Confidentialité** : Vos données restent locales
- ✅ **Pas de coûts** : Aucun frais d'API
- ✅ **Offline** : Fonctionne sans connexion internet
- ✅ **Personnalisation** : Choix libre des modèles

### Modèles recommandés

| Type      | Modèle                | Taille | Performance       |
| --------- | --------------------- | ------ | ----------------- |
| Chat      | Llama 3.1 8B Instruct | 8B     | Excellente        |
| Chat      | Mistral 7B Instruct   | 7B     | Très bonne        |
| Chat      | Phi-3 Mini            | 3.8B   | Bonne (rapide)    |
| Embedding | nomic-embed-text      | 137M   | Optimale pour RAG |

---

## 🚀 Déploiement en production

### 1. Compiler l'application

```bash
bun run build
```

### 2. Servir les fichiers statiques

Les fichiers compilés se trouvent dans le dossier `dist/`. Vous pouvez les servir avec n'importe quel serveur web (Nginx, Apache, etc.).

### 3. Variables d'environnement

En production, configurez les variables selon votre environnement de déploiement :

**Pour OpenAI :**

- `VITE_OPENAI_API_KEY` : votre clé API OpenAI

**Pour LM Studio ou API compatible :**

- `VITE_OPENAI_API_KEY` : clé d'authentification (peut être arbitraire)
- `VITE_OPENAI_BASE_URL` : URL de votre endpoint
- `VITE_EMBEDDING_MODEL` : nom du modèle d'embedding
- `VITE_CHAT_MODEL` : nom du modèle de chat

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la section [Dépannage](#🛠️-dépannage)
2. Consultez les issues GitHub
3. Ouvrez une nouvelle issue avec les détails du problème
