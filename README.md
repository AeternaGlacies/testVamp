# Nocturne — réseau social fictif (prototype v0.1)

Mini-application web statique et installable PWA pour une campagne de Vampire : La Mascarade. **Tout est fictif : aucun vrai réseau n'est sollicité, aucune authentification ou intrusion réelle.**

## Lancer en local

Depuis le dossier du projet : `python -m http.server 8000` puis ouvrir `http://localhost:8000/`. Ne pas double-cliquer sur `index.html` : les fichiers JSON ont besoin d'un serveur HTTP.

## Publier sur GitHub Pages

1. Créer un dépôt GitHub (p. ex. `nocturne`).
2. Déposer **le contenu** de ce dossier à la racine du dépôt : `index.html`, `app.js`, etc.
3. Dans *Settings → Pages*, choisir *Deploy from a branch*, branche `main`, dossier `/ (root)`.
4. Ouvrir `https://VOTRE-NOM.github.io/nocturne/` puis installer via le menu du navigateur (Android) ou *Partager → Sur l'écran d'accueil* (iPhone, Safari).

Les chemins sont relatifs pour prendre en charge un dépôt de projet GitHub Pages.

## Modifier le scénario

Éditer `data/world.json` :
- `posts` : publications avec un `id` unique, `author`, `initial`, `when`, `text`, `likes`, `comments`, éventuellement `attachment` et `clue`.
- `messages` : conversations avec `id`, `from`, `preview`, `body`, éventuellement `clue`.
- `archives` : documents avec `id`, `title`, `meta`, `content`, éventuellement `locked` et `clue`.

Le code d'accès de démonstration est **VSP-07**. Il apparaît dans une conversation de démonstration. Les indices de démonstration sont définis dans `app.js` (`clueNames`).

## Limites importantes

- Les nouveaux messages, commentaires et publications des joueurs ne sont **pas partagés** entre appareils. Ils restent dans `localStorage`.
- GitHub Pages est statique : il ne permet pas d'authentifier des joueurs, de cacher des secrets réellement sensibles ou de synchroniser des données entre joueurs. Les documents « verrouillés » sont purement narratifs et le contenu est visible dans le dépôt public.
- Pour de vrais comptes, de la synchronisation, une messagerie commune ou un panneau MJ privé, ajouter ultérieurement un serveur / service de base de données avec des règles d'accès (ex. Supabase ou Firebase).
- Lors de mises à jour, la progression enregistrée dans le navigateur est conservée, sauf si l'utilisateur supprime ses données locales. Pour forcer un nouveau cache d'installation, modifier la version `CACHE` dans `sw.js`.

## Installation et fichiers

`index.html` (interface), `styles.css` (visuel), `app.js` (interactions), `data/world.json` (contenu), `manifest.webmanifest` + `sw.js` + `assets/icon-*.png` (PWA).

Les noms, les entreprises et les évènements des données initiales sont entièrement fictifs. Le style est une proposition temporaire à faire évoluer avec le MJ.

## Nouveautés v0.2 — interface Facebook vampirique

- Interface responsive rouge sang et blanc cassé avec vrai style « réseau social » ; barre de navigation mobile.
- Onglet **Groupes**, avec abonnement/désabonnement fictif et publications réservées aux groupes rejoints.
- Indices dans les groupes et découverte progressive des pistes existantes.
- Déverrouillage des archives conservé localement après saisie du code ; un indice trouvé ne déverrouille plus automatiquement un document.
- Scénarios enrichis dans `data/world.json` avec la collection `groups`.

**Pour le maître de jeu :** il suffit de modifier et republier `data/world.json` entre les séances pour changer publications, groupes, messages et archives sur les appareils connectés. Les contenus sont publics dans un dépôt GitHub Pages, et les publications faites par un joueur n’apparaissent pas chez les autres. Prévoir un serveur et des comptes pour une véritable campagne multijoueur synchronisée. Ne placez aucun secret réel dans le JSON.
