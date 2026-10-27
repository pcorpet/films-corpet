# Soirée cinéma en famille

Application web pour parcourir le catalogue familial et trouver un film qui convient aux personnes présentes. Le dépôt contient une PWA publique et le code d'une Web App Apps Script avec connexion Google. **Les données du classeur ne doivent jamais être ajoutées au dépôt public.**

## Démarrer en local

Ouvrir `index.html` avec un petit serveur statique depuis la racine du dépôt, par exemple `python3 -m http.server 8000`, puis aller sur `http://localhost:8000`. Pour le mode local sans Apps Script, vider `FILM_API_URL` dans `config.js` et placer un jeu de données dans `data/films.json` (ce fichier est ignoré par Git).

## Deux modes publiés

1. **PWA publique sur GitHub Pages** : [ouvrir la version installable](https://pcorpet.github.io/films-corpet/). Elle utilise l'ancien endpoint Apps Script anonyme configuré dans `config.js`, pour que le navigateur puisse charger le catalogue et fonctionner hors ligne après le premier chargement. Toute personne pouvant appeler cet endpoint peut obtenir les données renvoyées par la feuille.

2. **Web App Apps Script avec connexion Google** : [ouvrir la version protégée](https://script.google.com/macros/s/AKfycbxDvLP84Muu9USOK2tMRv-9JPnbfpCKmprKyLczCS00R6gN8yA4ZY8S9ZYzGikZMUY9xQ/exec). Elle lit la feuille avec les droits du compte connecté. Partager le Google Sheets uniquement avec les comptes autorisés et configurer le déploiement pour qu'il s'exécute comme l'utilisateur accédant. Vérifier que cet endpoint sert les fichiers actuels du dossier `apps-script/`.

Les deux versions sont reliées par un lien en pied de page. Elles ne partagent pas le même niveau de confidentialité : l'ancienne passerelle PWA permet un accès public aux données, alors que l'accès à la Web App Apps Script dépend des permissions de la feuille.

Pour installer la PWA, ouvre sa page GitHub Pages dans le navigateur : sur Android/Chrome, choisis **Installer l'application** ou **Ajouter à l'écran d'accueil**; sur iPhone/iPad, ouvre-la dans Safari et choisis **Partager > Sur l'écran d'accueil**. La PWA conserve une copie locale du catalogue après le premier chargement pour fonctionner hors ligne. La version Apps Script n'enregistre pas automatiquement de copie du catalogue hors ligne. Les utilisateurs autorisés de la version Apps Script peuvent toutefois consulter ou copier les données affichées.

Le lien **Google Sheet** du pied de page n'apparaît qu'après une lecture autorisée. Après toute modification du code Apps Script, mettez à jour le déploiement de la Web App.

## État

Le code source des deux versions est dans le dépôt. `app.js` et `config.js` servent la PWA publique; `apps-script/` sert la Web App avec connexion Google. Les déploiements Apps Script doivent rester séparés pour préserver ces deux modes.
