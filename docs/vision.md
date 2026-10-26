# Vision et suivi — Soirée cinéma en famille

## Objectif

Créer un petit site web accessible à la famille pour décider plus facilement quel film regarder ensemble. Les données de départ sont dans un Google Spreadsheet privé. Le site doit les lire sans modifier la feuille.

## Préférences du produit

- Site accessible publiquement, sans compte utilisateur prévu à ce stade.
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

Piste retenue : dépôt GitHub public contenant uniquement le code, avec GitHub Pages pour l'interface statique et Google Apps Script comme passerelle en lecture seule vers Sheets. GitHub Pages est disponible avec GitHub Free pour les dépôts publics et ses limites annoncées sont largement supérieures au trafic attendu pour un usage familial. Apps Script lit uniquement les valeurs de l'onglet configuré sous le compte du propriétaire. L'interface appelle l'URL publique Apps Script via JSONP pour éviter de dépendre d'une configuration CORS.

Le dépôt public ne doit jamais contenir `data/films.json`, un export du classeur, des votes nominatifs, des années de naissance, des genres des membres, de credentials ou d'autres données privées. Un jeu de données local de démonstration est ignoré par Git. À la demande du propriétaire, le site et sa passerelle publique peuvent exposer les données des membres et les votes au navigateur; ces données viennent du Spreadsheet à l'exécution et ne sont pas codées dans le dépôt. Le déploiement public du script doit être vérifié depuis une fenêtre privée; les paramètres du compte Google Workspace peuvent restreindre l'accès anonyme. Apps Script applique des quotas susceptibles d'évoluer, mais ceux publiés sont très confortables pour les quelques visites attendues.

Étapes restantes pour relier le vrai classeur :

1. Récupérer l'ID du Google Sheets depuis son URL.
2. Créer un projet Apps Script et y copier `apps-script/Code.gs`.
3. Dans les paramètres du projet Apps Script, créer la propriété de script `SPREADSHEET_ID` avec l'ID du classeur.
4. Le lecteur utilise `Films` pour le catalogue et `Personnes` pour la liste des membres. Le script accepte les propriétés `FILM_SHEET_NAME` et `MEMBERS_SHEET_NAME` pour remplacer ces noms. Dans `Personnes`, les en-têtes attendus sont `Prénom`, `Année de naissance` et `Genre`.
5. Déployer le script comme application Web exécutée en tant que propriétaire et accessible à toute personne, puis vérifier son URL depuis une fenêtre privée.
6. Renseigner l'URL `/exec` du déploiement dans `config.js` et publier le dépôt avec GitHub Pages (Settings > Pages).

La feuille ne sera pas modifiée. Le code Apps Script est à garder en lecture seule. Les règles de partage de compte Google Workspace peuvent empêcher un déploiement anonyme; dans ce cas il faudra examiner les options du compte. La publication Pages suppose un dépôt public avec GitHub Free; GitHub recommande notamment un site de moins de 1 Go et annonce une limite souple de 100 Go de bande passante mensuelle.

## Décisions à confirmer / questions ouvertes

- La formule historique et le traitement des votes vides/neutres ont été relevés; conserver cette logique lors des évolutions.
- Confirmer si l'état « déjà vu » doit rester par navigateur ou être synchronisé avec la feuille (ce dernier choix nécessiterait une écriture autorisée, donc sort du mode lecture seule).
- Les années de naissance, genres, noms et votes restent dans Google Sheets; la passerelle renvoie les champs nécessaires à l'interface publique. Ils ne sont pas stockés dans le dépôt GitHub.
- Le site affiche les votes individuels; le propriétaire a confirmé que les données transmises par la passerelle publique peuvent être consultables depuis le site.
- Déploiement final et URL publique à faire après validation de l'application.

## État actuel

- Inspection du classeur terminée; aucun changement fait au fichier source.
- Première interface statique, passerelle Apps Script, jeu de données local ignoré par Git et documentation créés; branchement Google et mise en ligne restent à faire.
- Le dépôt public `PCORPet/films-corpet` a été créé et relié au dossier local; son contenu n'a pas encore été poussé.
- Aucun accès direct à une session Google Sheets n'est connecté dans Codex; la future application utilisera l'accès autorisé par Apps Script.

## Reprise par une autre session

Lire ce document puis `README.md`. Vérifier le nom de l'onglet dans `apps-script/Code.gs`, les éventuelles modifications non validées dans le dépôt, puis traiter les questions ouvertes. Ne jamais publier l'instantané du classeur ou déployer l'application avant que l'utilisateur ait vérifié les informations familiales incluses.
