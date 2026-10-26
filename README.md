# Soirée cinéma en famille

Application web pour parcourir le catalogue familial et trouver un film qui convient aux personnes présentes. Le dépôt contient l'interface et une passerelle Google Apps Script prévue pour lire la feuille en direct. **Les données du classeur ne doivent jamais être ajoutées au dépôt public.**

## Démarrer en local

Ouvrir `index.html` avec un petit serveur statique depuis la racine du dépôt, par exemple `python3 -m http.server 8000`, puis aller sur `http://localhost:8000`. Pour le prototype local, placer un jeu de données dans `data/films.json` (ce fichier est ignoré par Git).

## Connexion à Google Sheets

L'interface statique sera publiée gratuitement avec GitHub Pages. Le dossier `apps-script/` contient le lecteur en lecture seule qui renverra les films à l'interface. Son URL publique sera configurée dans `config.js`; elle n'est pas un secret. Voir [la documentation du projet](docs/vision.md) pour les étapes et décisions.

## Installation sur téléphone

Le site déclare son manifeste dans `manifest.webmanifest` et son service worker dans `sw.js`. Une fois publié en HTTPS (GitHub Pages fournit HTTPS), il peut être ajouté à l'écran d'accueil depuis le navigateur. Sur les navigateurs compatibles, le bouton **Installer** apparaît dans l'en-tête. Le service worker met en cache les fichiers de l'application ; le catalogue Google Sheets est conservé dans le stockage du navigateur après son premier chargement pour permettre une consultation hors ligne. Les données locales du navigateur restent propres à l'appareil.

Le lien **Google Sheet** du pied de page est fourni par la passerelle Apps Script. Après une modification de `apps-script/Code.gs`, redéployez une nouvelle version de la Web App pour que le lien apparaisse sur le site.

## État

Prototype initial. Le dépôt GitHub est créé et relié au dossier local. La connexion au vrai Google Sheets se fera via Apps Script après configuration de l'ID du classeur et autorisation du script par son propriétaire. L'application n'est pas encore publiée.
