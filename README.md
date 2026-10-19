# Nocturne — Réseau Saguenay (v0.5)

**Site prévu :** https://aeternaglacies.github.io/testVamp/

Réseau social fictif, pour une campagne Vampire : La Mascarade. Les visiteurs voient le même contenu public sans compte individuel.

## Où déposer les fichiers ?

- **Fil de cette semaine :** `contenu/semaine/` — tout fichier `.txt`, `.png`, `.jpg`, `.jpeg`, `.gif` ou `.webp` devient une publication. Une image et un texte sont deux publications distinctes.
- **Messages du réseau :** `contenu/messages/` — chaque `.txt` devient une information connue de tous. Les images sont également prises en charge.
- **Archives :** `contenu/archives/1/`, `contenu/archives/2/`, `contenu/archives/3/`, etc. — le maître de jeu déplace ou copie manuellement les fichiers des semaines antérieures dans les dossiers numérotés.

Ordre : alphabétique selon les noms de fichiers pour la semaine et les messages; dossiers d'archives numérotés du plus grand au plus petit. Préfixez les noms `01-`, `02-` pour contrôler l'ordre.

## Publication GitHub Pages

1. Décompressez ce projet à la racine du dépôt **AeternaGlacies/testVamp**, y compris le dossier caché `.github/`.
2. Activez GitHub Pages : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. Envoyez les fichiers sur la branche `main`. L'action `Publier Nocturne` construit automatiquement `data/index.json` et publie l'application.
4. Accédez à https://aeternaglacies.github.io/testVamp/.

### Travail hebdomadaire

1. Copiez/déplacez manuellement les publications de `contenu/semaine/` vers `contenu/archives/NUMÉRO/`.
2. Ajoutez les nouveaux `.txt` et images dans `contenu/semaine/`.
3. Actualisez/ajoutez les fichiers `.txt` de `contenu/messages/`.
4. Faites un **commit/push** : GitHub Actions republie et met à jour l'index automatiquement.

**Dépannage :** si des fichiers manquent, vérifiez qu’ils apparaissent bien dans les dossiers du dépôt GitHub (pas uniquement sur votre ordinateur), puis ouvrez Actions → Publier Nocturne et confirmez que la publication réussit. Rafraîchissez la page; sur une PWA installée, fermez puis rouvrez l’application. Le chargement de la liste en direct nécessite l’accès à l’API publique de GitHub; si elle est indisponible, `data/index.json` sert de solution de repli.

**Attention :** Github Pages est public. Les visiteurs pourraient consulter les fichiers par URL, même ceux qui ne sont pas liés dans le menu. N'y mettez aucune donnée réelle ni aucun secret censé être inaccessible aux joueurs.

## Tester localement

Depuis la racine du dossier :

```bash
python scripts/generer_index.py
python -m http.server 8000
```

Puis ouvrez http://localhost:8000/ (ne pas ouvrir `index.html` par double-clic).

## PWA et limites

- La PWA est installable via son manifeste et un service worker; le chemin relatif `./` fonctionne sous `/testVamp/`.
- En ligne, les publications et l'index sont rafraîchis depuis GitHub Pages. Hors ligne, seules les ressources déjà consultées peuvent être accessibles.
- Pas d'authentification, de comptes multiples, de commentaires ni de messages privés : c'est volontaire, tout le monde voit le même contenu.
- Aucune fonction de piratage réel.

## Noms des fichiers = identité des publications

Utilisez **`{couleur}_{nom}_{qui}.{extension}`**. Les trois champs sont séparés par des underscores (`_`).

- **couleur** : `rouge`, `bleu`, `vert`, `jaune`, `orange`, `violet`, `rose`, `noir`, `gris`, `brun`, `blanc` (couleur de l'avatar).
- **nom** : titre de la publication. Utilisez des traits d'union si besoin (`Sirop-mysterieux`).
- **qui** : nom de l'auteur affiché (par exemple `Marie-Tremblay`).
- **extension** : `.txt`, `.png`, `.jpg`, `.jpeg`, `.gif` ou `.webp`.

Exemples :

- `rouge_Le-sirop_Marie-Tremblay.txt` → publication « Le sirop » de Marie Tremblay, avatar rouge « MT ».
- `bleu_Photo-du-quai_Jules-Martin.jpg` → image publiée par Jules Martin, avatar bleu « JM ».
- `vert_Temoignage_Alex.png` → image publiée par Alex, avatar vert « A ».
- `01_rumeur_sirop.txt` → **profil générique gris** « Membre du réseau », aucune couleur ni auteur reconnu.

Si le format n'est pas valide ou si la couleur n'est pas reconnue, le profil générique gris est utilisé. Les images du dossier restent les pièces jointes/publications : le fichier ne devient pas une photo de profil. Dans Messages et Archives, l'auteur est également affiché. Pour modifier la couleur d'une publication, renommez le fichier puis republiez le dépôt.
