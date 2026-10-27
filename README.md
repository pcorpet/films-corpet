# Soirée cinéma en famille

Application web pour parcourir le catalogue familial et trouver un film qui convient aux personnes présentes. Le dépôt contient l'interface et une passerelle Google Apps Script prévue pour lire la feuille en direct. **Les données du classeur ne doivent jamais être ajoutées au dépôt public.**

## Démarrer en local

Ouvrir `preview.html` avec un petit serveur statique depuis la racine du dépôt, par exemple `python3 -m http.server 8000`, puis aller sur `http://localhost:8000/preview.html`. Pour le prototype local, placer un jeu de données dans `data/films.json` (ce fichier est ignoré par Git). La page `index.html` sert de passerelle GitHub Pages vers la Web App protégée.

## Connexion protégée à Google Sheets

La version publiée doit être servie directement par la Web App Apps Script (`apps-script/Index.html`, `Styles.html`, `Client.html`, `Code.gs`). Déployer avec accès « Toute personne disposant d'un compte Google » et exécution « Utilisateur accédant à l'application Web ». Partager ensuite le classeur uniquement avec les comptes familiaux autorisés. La lecture échouera pour les comptes sans accès au classeur. Ne pas remettre une URL de passerelle publique dans `config.js` ni publier un endpoint anonyme. Voir [la documentation du projet](docs/vision.md) pour les étapes de déploiement et les limites.

URL de Web App communiquée : [ouvrir Soirée cinéma](https://script.google.com/macros/s/AKfycbzeWGNB8qK5yOo2kd1C5uUW2wFaGm9KV8EvB9XjiA_YZxOP9i1ym8eb5PLbzZyHfAL8iQ/exec). Il reste à confirmer dans Apps Script que ce déploiement utilise bien la version protégée et les paramètres d'accès prévus.

## Installation sur téléphone

Le prototype statique peut toujours être lancé localement via `preview.html`. La version privée Apps Script n'enregistre pas automatiquement de copie du catalogue hors ligne dans le navigateur. Les utilisateurs autorisés peuvent toutefois consulter ou copier les données affichées; le partage de la feuille ne peut pas empêcher un utilisateur autorisé d'en faire une copie.

Le lien **Google Sheet** du pied de page n'apparaît qu'après une lecture autorisée. Après toute modification du code Apps Script, mettez à jour le déploiement de la Web App.

## État

Le code de la Web App protégée est prêt dans `apps-script/`. Il reste à le copier dans le projet Apps Script, configurer `SPREADSHEET_ID`, partager la feuille avec la liste autorisée, puis mettre à jour le déploiement avec les bons paramètres d'accès et d'exécution.
