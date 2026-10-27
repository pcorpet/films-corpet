# Vision et suivi — Soirée cinéma en famille

## Objectif

Créer un petit site web accessible à la famille pour décider plus facilement quel film regarder ensemble. Les données de départ sont dans un Google Spreadsheet privé. Le site doit les lire sans modifier la feuille.

## Préférences du produit

- Site réservé aux comptes Google auxquels le classeur est partagé.
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

Architecture retenue : dépôt GitHub public contenant le code source, avec GitHub Pages comme page de redirection vers la Web App Apps Script qui sert l'interface. Le déploiement exige une connexion Google et s'exécute en tant qu'utilisateur accédant. Le script ouvre le classeur avec les droits de cette personne; le partage du Google Sheets avec les seuls comptes familiaux autorisés constitue le contrôle d'accès aux données. L'interface appelle `getFilmsForViewer` via `google.script.run` et ne met pas le catalogue en cache localement.

Le dépôt public ne doit jamais contenir `data/films.json`, un export du classeur, des votes nominatifs, des années de naissance, des genres des membres, de credentials ou d'autres données privées. Un jeu de données local de démonstration est ignoré par Git. Le code de la Web App peut être public, mais il faut révoquer toute ancienne version de déploiement configurée en accès anonyme : changer le code source seul ne protège pas une ancienne URL/version active. Les utilisateurs autorisés peuvent conserver ou copier les informations qu'ils consultent dans leur navigateur.

Étapes restantes pour relier le vrai classeur :

1. Récupérer l'ID du Google Sheets depuis son URL.
2. Créer un projet Apps Script et y copier `apps-script/Code.gs`.
3. Dans les paramètres du projet Apps Script, créer la propriété de script `SPREADSHEET_ID` avec l'ID du classeur.
4. Le lecteur utilise `Films` pour le catalogue et `Personnes` pour la liste des membres. Le script accepte les propriétés `FILM_SHEET_NAME` et `MEMBERS_SHEET_NAME` pour remplacer ces noms. Dans `Personnes`, les en-têtes attendus sont `Prénom`, `Année de naissance` et `Genre`.
5. Ajouter au projet Apps Script les fichiers `Code.gs`, `Index.html`, `Styles.html` et `Client.html` depuis `apps-script/`.
6. Partager le classeur en lecture seule avec chaque compte Gmail familial autorisé.
7. Mettre à jour la Web App avec accès « Toute personne disposant d'un compte Google » et exécution « Utilisateur accédant à l'application Web ». Ne pas choisir l'accès anonyme.
8. Tester avec un compte autorisé et un autre compte non partagé. Le premier doit autoriser le script; le second ne doit pas pouvoir lire les données. Désactiver ou supprimer tout ancien déploiement anonyme.
9. GitHub Pages sert `index.html`, qui redirige vers l'URL `/exec`; `preview.html` reste réservé au prototype local. Ne pas publier un catalogue dans le dépôt.

La feuille ne sera pas modifiée par l'application. Le code Apps Script est à garder en lecture seule. Chaque utilisateur devra autoriser le script lors de sa première utilisation. Les règles Google Workspace peuvent restreindre les déploiements ou le partage externe. La version privée doit être ouverte via l'URL `/exec` Apps Script, pas par GitHub Pages.

## Décisions à confirmer / questions ouvertes

- La formule historique et le traitement des votes vides/neutres ont été relevés; conserver cette logique lors des évolutions.
- Confirmer si l'état « déjà vu » doit rester par navigateur ou être synchronisé avec la feuille (ce dernier choix nécessiterait une écriture autorisée, donc sort du mode lecture seule).
- Les années de naissance, genres, noms et votes restent dans Google Sheets; le script ne renvoie les champs nécessaires qu'aux comptes ayant accès au classeur. Ils ne sont pas stockés dans le dépôt GitHub.
- Le site affiche les votes individuels uniquement aux utilisateurs pouvant lire le classeur.
- Vérifier et révoquer toute ancienne version Apps Script anonyme, puis publier la nouvelle version avec exécution comme utilisateur accédant.

## État actuel

- Inspection du classeur terminée; aucun changement fait au fichier source.
- Interface Apps Script et lecture sous l'identité de l'utilisateur implémentées dans le dépôt; configuration et déploiement Google restent à faire.
- Le dépôt public `PCORPet/films-corpet` contient uniquement le code; vérifier que le jeu de données local reste ignoré avant toute publication.
- Aucune session Google Sheets n'est connectée dans Codex; les opérations de partage et le déploiement doivent être faits dans le compte Google du propriétaire.

## Reprise par une autre session

Lire ce document puis `README.md`. Vérifier le nom de l'onglet dans `apps-script/Code.gs`, synchroniser les fichiers HTML Apps Script, vérifier les modifications non validées, puis traiter les questions ouvertes. Ne jamais publier l'instantané du classeur. Après bascule, révoquer toute ancienne URL anonyme.
