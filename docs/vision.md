# Vision et suivi — Soirée cinéma en famille

## Objectif

Créer un petit site web accessible à la famille pour décider plus facilement quel film regarder ensemble. Les données de départ sont dans un Google Spreadsheet privé. Le site doit les lire sans modifier la feuille.

## Préférences du produit

- Deux modes coexistent : PWA publique sur GitHub Pages et Web App Apps Script avec accès via les permissions du Google Sheets.
- Ne pas ajouter de service payant.
- Lire le vrai Google Sheets en direct une fois la version de démonstration construite.
- Utiliser le fichier Excel téléchargé comme source de travail initiale.
- Conserver cette documentation à jour pour qu'une autre session ou un autre agent puisse reprendre le travail sans refaire les découvertes.

## Ce que contient le classeur fourni

Le classeur de départ est privé et ne doit pas être copié dans le dépôt.

- Onglet principal : films, colonnes `Film`, `PEGI`, `DUREE`, `Type de film`, `Dispo sur`, des colonnes de votes portant les prénoms des membres, `Score`, `Vue ?`, `Combo`.
- L'onglet principal actuel s'appelle `Films`; le lecteur Apps Script l'utilise par défaut.
- Les votes observés sont `1`, `0`, `-1` et des cellules vides. Formule relevée en `M4` : si une personne présente a voté `-1`, le résultat est « Pas envie » et le film est écarté; sinon, si une personne absente a voté `1`, le résultat est « Manque qqun » et le film est gardé pour une prochaine séance; sinon, score numérique = somme des votes des personnes présentes moins 5 fois la somme des votes des personnes absentes. Comme un « non » absent vaut `-1`, cette soustraction lui donne bien `+5` points. Un « oui » présent ajoute 1 point, neutre/vide valent 0. L'application applique ces mêmes règles et classe les candidats par score décroissant.
- Les âges et genres des membres sont des données privées conservées dans l'onglet `Personnes` du Google Spreadsheet, jamais dans le dépôt GitHub. Le filtre automatique utilise l'âge estimé à partir de l'année de naissance; le filtre reste réglable manuellement.
- Les catégories ne sont pas normalisées (`Science-Fiction`/`Science Fiction`, genres combinés, etc.). Pour l'instant l'app les reprend telles quelles.
- La colonne `Vue ?` est vide dans l'export inspecté. Le prototype garde l'état « déjà vu » localement dans le navigateur; il ne l'écrit pas dans Sheets.

## Première version visée

- Rechercher un film par titre.
- Choisir les personnes présentes.
- Afficher directement les films après le choix des personnes; garder recherche, plafond PEGI, durée, genre et statut « déjà vu » repliés sous « Plus d’options ».
- Basculer rapidement leur présence avec la lettre de raccourci affichée, sans intercepter les frappes pendant la saisie dans un champ.
- Filtrer par âge PEGI maximal, durée maximale et genre.
- Afficher les meilleurs candidats en premier, avec titre, genre, PEGI, durée, disponibilité et les votes de toute la famille. Chaque rond donne au survol le prénom, la présence/absence, le vote et son effet sur l'éligibilité ou le score.
- Marquer localement un film comme déjà vu.
- Fonctionner avec l'instantané local en mode prototype, puis lire les données du Google Sheets sans changement de l'interface.

## Hébergement et connexion Google Sheets sans coût

Deux déploiements sont conservés. (1) La PWA publique GitHub Pages sert `index.html`, `app.js`, le manifeste et le service worker; elle appelle l'ancien endpoint JSONP Apps Script configuré dans `config.js` et garde une copie hors ligne dans le navigateur. (2) La Web App Apps Script sert `apps-script/Index.html`, `Styles.html` et `Client.html`, s'exécute comme l'utilisateur accédant et lit la feuille via `google.script.run`; l'accès dépend du partage du Google Sheets. Le code Apps Script de cette version est dans `apps-script/Code.gs`.

Le dépôt public ne doit jamais contenir `data/films.json`, un export du classeur, des votes nominatifs, des années de naissance, des genres des membres ou des credentials. La PWA publique utilise cependant une ancienne passerelle Apps Script en accès anonyme; toute personne connaissant son URL peut demander le catalogue renvoyé, et les visiteurs de la PWA peuvent le conserver hors ligne. Cette version publique est intentionnelle pour maintenir l'ancien mode installable. La Web App Apps Script protégée utilise un autre déploiement et l'identité du visiteur; les utilisateurs autorisés peuvent néanmoins copier ce qu'ils consultent.

## Accès aux deux versions

- PWA GitHub Pages : https://pcorpet.github.io/films-corpet/ . `config.js` référence l'ancien déploiement JSONP Apps Script : `https://script.google.com/macros/s/AKfycbwT1K38gkuStEZNbTsGNLGB0pX3eSItHievoCVTqO2B9Pmur_uRJHFQt3_boH3nXaSrcQ/exec`.
- Web App Apps Script avec connexion Google : https://script.google.com/macros/s/AKfycbxDvLP84Muu9USOK2tMRv-9JPnbfpCKmprKyLczCS00R6gN8yA4ZY8S9ZYzGikZMUY9xQ/exec . Elle sert les fichiers de `apps-script/` et doit être configurée avec accès aux comptes Google et exécution comme utilisateur accédant.

La feuille ne sera pas modifiée par l'application. Partager le classeur uniquement avec les comptes autorisés pour protéger l'accès via la Web App Apps Script. Ce partage ne protège pas les données renvoyées par l'ancien endpoint anonyme de la PWA. Ne pas remplacer l'URL Apps Script de `config.js` par l'URL de la Web App protégée : l'appel JSONP de la PWA et l'accès protégé par `google.script.run` sont deux modes distincts. Chaque version a un lien en pied de page vers l'autre.

## Décisions à confirmer / questions ouvertes

- La formule historique et le traitement des votes vides/neutres ont été relevés; conserver cette logique lors des évolutions.
- Confirmer si l'état « déjà vu » doit rester par navigateur ou être synchronisé avec la feuille (ce dernier choix nécessiterait une écriture autorisée, donc sort du mode lecture seule).
- La version Apps Script protégée affiche les votes aux comptes pouvant lire le classeur.
- La PWA publique appelle l'ancien endpoint Apps Script anonyme et expose les données de sa réponse à toute personne qui connaît l'URL. Maintenir cette passerelle active est nécessaire au mode PWA actuel.

## État actuel

- Inspection du classeur terminée; aucun changement fait au fichier source.
- PWA GitHub Pages restaurée depuis l'historique Git avec manifeste et service worker; elle utilise l'ancien endpoint Apps Script.
- L'utilisateur indique avoir copié le dossier `apps-script/` dans Apps Script et déployé la Web App avec l'URL documentée.
- Le dépôt public `PCORPet/films-corpet` contient le code et les deux liens; aucun jeu de données familial ne doit y être publié.
- L'ancien endpoint anonyme est maintenu actif pour le mode PWA; la version PWA transmet au navigateur les données de sa réponse.

## Reprise par une autre session

Lire ce document puis `README.md`. Vérifier le nom de l'onglet dans `apps-script/Code.gs`, synchroniser les fichiers HTML Apps Script, vérifier les modifications non validées, puis traiter les questions ouvertes. Ne jamais publier l'instantané du classeur. Conserver les deux déploiements Apps Script distincts : l'ancien anonyme pour la PWA et le nouveau avec connexion Google pour la Web App protégée.
