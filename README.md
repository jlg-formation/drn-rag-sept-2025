# 🤖 RAG Chat - Assistant IA avec Recherche Vectorielle

Un système de chat intelligent qui utilise la technologie RAG (Retrieval-Augmented Generation) pour répondre aux questions en se basant sur votre documentation locale.

## 📋 Fonctionnalités

- 💬 **Interface de chat moderne** avec React et TailwindCSS
- 🔍 **Recherche vectorielle** pour trouver les informations pertinentes
- 📚 **Ingestion automatique** de documents (`.txt`, `.md`)
- 🧠 **Réponses contextualisées** grâce à OpenAI GPT-4
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

### Clé API OpenAI

- Créer un compte sur [OpenAI](https://platform.openai.com/)
- Générer une clé API dans les paramètres

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

Créer un fichier `.env` à la racine du projet :

**Sur Windows :**

```powershell
echo "VITE_OPENAI_API_KEY=votre_clé_api_ici" > .env
```

**Sur Linux :**

```bash
echo "VITE_OPENAI_API_KEY=votre_clé_api_ici" > .env
```

Remplacez `votre_clé_api_ici` par votre vraie clé API OpenAI.

### 4. Préparer la documentation

Le dossier `docs/` contient déjà quelques fichiers d'exemple. Vous pouvez :

- Ajouter vos propres fichiers `.txt` ou `.md` dans le dossier `docs/`
- Modifier les fichiers existants selon vos besoins

---

## 📖 Utilisation

### 1. Ingestion des documents

Avant de démarrer l'application, vous devez traiter vos documents pour créer la base vectorielle :

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
- Générer des embeddings avec OpenAI
- Créer le fichier `vectorStore.json`

**Exemple de sortie :**

```
🚀 Début de l'ingestion RAG...

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
2. Tapez votre question dans le champ de saisie
3. L'assistant recherchera dans vos documents et répondra avec le contexte approprié

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
├── .env                   # 🔑 Clés API (à créer)
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

### Problème : "Clé OpenAI manquante"

**Solution :** Vérifiez votre fichier `.env` :

1. Le fichier existe à la racine du projet
2. La variable est bien nommée `VITE_OPENAI_API_KEY`
3. La clé API est valide

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

## 🚀 Déploiement en production

### 1. Compiler l'application

```bash
bun run build
```

### 2. Servir les fichiers statiques

Les fichiers compilés se trouvent dans le dossier `dist/`. Vous pouvez les servir avec n'importe quel serveur web (Nginx, Apache, etc.).

### 3. Variables d'environnement

En production, configurez `VITE_OPENAI_API_KEY` selon votre environnement de déploiement.

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
