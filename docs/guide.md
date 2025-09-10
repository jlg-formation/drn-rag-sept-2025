# Guide de démarrage

Bienvenue dans notre système RAG ! Ce guide vous aidera à comprendre les concepts de base.

## Qu'est-ce que RAG ?

RAG (Retrieval-Augmented Generation) est une technique qui combine la recherche d'informations avec la génération de texte. Elle permet d'améliorer les réponses des modèles de langage en leur fournissant des informations contextuelles pertinentes.

## Comment ça fonctionne ?

1. **Ingestion** : Les documents sont découpés en chunks et transformés en embeddings
2. **Recherche** : Quand une question est posée, on trouve les chunks les plus pertinents
3. **Génération** : Le modèle génère une réponse en utilisant ces chunks comme contexte

## Avantages

- Réponses plus précises et factuelles
- Possibilité d'utiliser des connaissances spécifiques
- Réduction des hallucinations du modèle
