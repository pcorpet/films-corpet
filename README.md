# Soirée cinéma en famille

Application web pour parcourir le catalogue familial et trouver un film qui convient aux personnes présentes. Le dépôt contient l'interface et une passerelle Google Apps Script prévue pour lire la feuille en direct. **Les données du classeur ne doivent jamais être ajoutées au dépôt public.**

## Démarrer en local

Ouvrir `index.html` avec un petit serveur statique depuis la racine du dépôt, par exemple `python3 -m http.server 8000`, puis aller sur `http://localhost:8000`. Pour le prototype local, placer un jeu de données dans `data/films.json` (ce fichier est ignoré par Git).

## Connexion à Google Sheets

L'interface statique sera publiée gratuitement avec GitHub Pages. Le dossier `apps-script/` contient le lecteur en lecture seule qui renverra les films à l'interface. Son URL publique sera configurée dans `config.js`; elle n'est pas un secret. Voir [la documentation du projet](docs/vision.md) pour les étapes et décisions.

## État

Prototype initial. Le dépôt GitHub est créé et relié au dossier local. La connexion au vrai Google Sheets se fera via Apps Script après configuration de l'ID du classeur et autorisation du script par son propriétaire. L'application n'est pas encore publiée.
