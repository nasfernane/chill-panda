## *Projet de stage de Nassim Fernane du 04/01/2021 au 29/01/2021*

# Table des matières

1. [Objectifs du projet](#objectifs)
2. [Fonctionnement et description du site](#description)
3. [Organisation du code](#organisation)
4. [Journal de bord](#journal)
   1. [Jour 1](#jour1)
   2. [Jour 2](#jour2)
   3. [Jour 3](#jour3)

# **OBJECTIFS DU PROJET <a name="objectifs"></a>**

-   Maquetter les interfaces de saisies et de consultations.
-   Création d’une base de données.
-   Création d’une application web (framework à définir).
-   Création d’une API REST (Node.js).
-   Opération CRUD sur la base de données (via l’API).
-   Publication de front-end et back-end sur un serveur de production.
-   Réalisation de tests fonctionnels.

# **FONCTIONNEMENT ET DESCRIPTION DU SITE <a name="description"></a>**

### Page 1

...

### Page 2

...

# **ORGANISATION DU CODE<a name="organisation"></a>**

# **JOURNAL DE BORD<a name="journal"></a>**

## **Jour 1**<a name="jour1"></a>

### <ins>_Définition du projet et de ses objectifs_</ins>

Distinction des problématiques et choix technologiques en conséquence.

Création du projet sur VS-Code et mise en place des outils de travail : Installation de Node.js et Express pour la gestion du back-end, puis de MongoDB et Mongoose pour la base de données. Ajout de compass en tant qu'interface graphique, et Postman pour gérer les tests de requêtes au serveur.

Initialisation du projet sur Git et mise en relation sur Github. Installation des outils de formatage du code (eslint, prettier) puis configuration de leur spécificités dans un fichier dédié, afin d'uniformiser les pratiques et rendus pour d'éventuels futurs collaborateurs.

Côté front-end, installation du framework CSS Sass et première ébauche de son architecture basée sur le pattern 7-1.

### <ins>_Fondations du Back-End_</ins>

Premiers pas dans les fondations du back-end. Je découvre Express et ses premières fonctionnalités pour structurer une application Node. Création du serveur en local, et d'un fichier de configuration
pour les variables environementales. Celui-ci me servira à gérer les données sensibles et tout ce qui touche à la connexion et l'authentification sur les différents services (base de donnée, web
tokens, identifiants de mailing, etc.). Je définis un port par défaut (en plus de celui choisi dans le fichier config), et un écouteur sur ce dernier afin de log la connexion et le port. Création d'un fichier gitignore pour garder le fichier de configuration en local pour des raisons évidentes de
sécurité.

Phase d'apprentissage : Expérimentation sur les premiers modules, premières opérations CRUD en local avec le module File System et tests sur leur variantes asynchrones. Premier bain dans les templates
construits à partir des resultats d'un fichier Json, toujours en local. A terme, les templates seront nourris par les résultats de notre API Rest.

J'expérimente et je met également en place les premiers routeurs qui serviront les requêtes vers les bases de données pour les utilisateurs et leurs projets/devis. Première difficulté : visualiser
clairement le chemin fonctionnel de l'application et de ses différentes ramifications. L'application est factorisée dans son propre fichier, mais requise dans le serveur.js qui se chargera à terme de faire le pont avec la base de données. L'application, de son côté, importe ses propres modules et middlewares qui serviront à tracer des jalons successifs : en effet, une application express répond à une requête par un chemin de middlewares, petites fonctions intermédiaires qui définiront chacune à leur tour le comportement de notre application selon la requête soumise par l'utilisateur. A cette
occasion j'apprends à importer un middleware, mais aussi à en créer de toutes pièces.

Début de la construction de l'API : gestion basique des requêtes GET, POST, PATCH, et DELETE pour pallier à nos premiers besoins de persistance des données. Je paramètre Postman pour éprouver
chacune des requêtes. Ce dernier est très utile pour simuler des requêtes très précises par navigateur, sauvegarder ces requêtes et les organiser pour tester efficacement notre API. A cette
occasion j'implémente/factorise grâce à Express des routeurs séparés pour les utilisateurs et les projets, afin de les dissocier dans des fichiers séparés qui accueilleront leur modules, et la définition de chacun des itinéraires qui desserviront les deux bases de données.

J'approndis davantage mes connaissances sur les middlewares en experimentant sur les paramètres (comme par exemple un itinéraire /:id pour les utilisateurs) et en apprenant comment enchaîner différents middlewares à la suite.

Introduction à MongoDB : Création de la première base de données en ligne sur Atlas. MongoDB propose une gestion de base de données qui, contrairement à des bases de données relationnelles classiques, se base sur des données sauvegardées en format JSON, avec le double bénéfice d'une syntaxe plus accessible et plus lisible pour les utilisateurs déjà initiés à JavaScript.

Mise en jambes : setup de la base de données et première collection sur Atlas et expérimentation de Compass, l'interface graphique permettant d'accéder à notre base de données plus facilement. J'en profite pour lier la base de donnée Atlas au mongo shell, puis à l'application en local, et enfin à Compass en vue de faciliter le développement.

Définition de deux modes séparés pour l'application, développement et production afin de distinguer la version en phase de construction et la version qui sera déployée pour l'utilisateur. Ca nous permettra d'avoir des comportements différents, notemment à terme une gestion des erreurs personnalisée en fonction du contexte.

Je continue ensuite sur les opérations CRUD avec des requêtes pour créer un nouveau document, le mettre à jour ou le supprimer.

### <ins>_Introduction de Mongoose_</ins>

Je connecte enfin la base de données à l'application Express, en apprenant les premiers rudiments de cette librairie qui facilite grandement la modélisation des données orientées objet. Mongoose permet notamment de créer des schémas qui sont des classes JS desquelles découlent les modèles pour créer les données qui alimenteront nos bases de données. Je commence par créer un modèle Utilisateur, sous format JSON, avec pour chaque propriété le détail de ses options. Par exemple on peut définir le type de données du nom de l'utilisateur sur String, indiquer que le champ est obligatoire, lui imposer une taille minimale ou maximale, ou encore forcer le lowercase.

Il est également possible d'intégrer des validateurs, pour par exemple vérifier que l'email entré par un utilisateur est au bon format, ou que le mot de passe correspond à celui de confirmation.
Chaque type de données possède des propriétés spécifiques pour personnaliser chaque champ.

Quand le modèle est fini, il devient exportable sous forme de module afin de le rendre utilisable n'importe où dans l'application.

Phase d'expérimentation sur le modèle, création de nouveaux utilisateurs, modifications des données.

Je commence à factoriser le site dans une optique MVC (Modèle Vues Controllers) en séparant les modèles et les controllers dans deux dossiers distincts. Les modèles stockent le schéma, les hooks
et les méthodes instanciées pour définir un comportement par défaut propre à l'utilisateur, par exemple. Les controllers détiennent les fonctions pour "contrôler" ces modèles selon en fonction des
requêtes envoyées à l'API.

Création d'un premier modèle Projects pour gérer le devis de l'utilisateur, contenant un nom, un
type de projet, un nom de client, un montant de devis et de factures, et un status pour notifier
l'avancement du projet. Implémentation de fonctionnalités pour traiter les données dans un fichier
utilitaire dédié : APIFeatures, qui nous permet de définir un ensemble de méthodes comme filter()
qui filtre les résultats en fonction de champs exclus définis, sort() qui trie par défaut les
résultats par date de création mais peut également trier en fonction du champ entré par
l'utilisateur en paramètre, ou encore limiteFields() qui selectionne seulement des champs choisis.
Enfin, paginate() sépare les résultats en plusieurs pages s'ils sont trop nombreux, selon un
paramétrage adaptable (nombre de résultats par page) et permet à l'utilisateur de naviguer entre les
pages.

Découverte des aggregation pipelines : processus pour faire transiter des données dans un tunnel
jalonné d'étapes pour traiter et recouper des données ou encore établir des statistiques.

Import du module Validator pour faciliter certains validateurs dans les schémas mangoose.
Développement de validateurs personnalisés.

## **JOUR 2**<a name="jour2"></a>

### <ins>_Phase Gestion des Erreurs_</ins>

Test et ajout de ndb (Node Debugguer) qui ouvre une interface dédiée à la visibilité et corrections
des bugs sur Node.JS. En plus de proposer des breakpoints classiques, il offre un visuel clair et très détaillé sur le callstack, les processus Node, et la portée des variables déclarées à chaque
étape. Il permet également d'accéder à la console, aux performances live de l'application et de jeter un oeil à certaines fonctionnalitées relatives à la mémoire allouée.

A la fin de toutes les déclarations de route, ajout d'une gestion d'erreur pour les routes qui n'existent pas.

Création d'un middleware de gestion globale des erreurs dans les controllers. Il sera chargé de récupérer toutes les erreurs transitant en fin de chaîne sur l'application, pour envoyer une réponse
personnalisée en fonction du mode de déploiement de l'application et du type d'erreurs. Lorsque l'application est en mode développement, on veut pouvoir accéder à l'intégralité de l'erreur avec le
plus de détails possibles, tandis que lorsqu'elle se trouve en mode production elle renvoie à un ensemble d'erreurs individualisées en fonction du type d'erreur attrapée. Développement entre autres
d'une erreur spécifique pour une erreur de champ, pour un doublon de données ou encore un rejet des validateurs mongoose. Le middleware global renvoie ensuite l'erreur avec le status adapté et un message concis mais sans détails pour ne pas encombrer l'utilisateur et également ne pas dévoiler d'éventuelles failles de sécurité.

Ajout de gestion des erreurs dans les fonctions asynchrones, et d'une fonction catchAsync pour remplacer tous les blocs try/catch en vue de mieux factoriser le site et améliorer la lisibilité.
Dans la même optique, création d'un constructor AppError pour avoir un "modèle" d'erreur à renvoyer de façon plus concise avec deux paramètres : message personnalisé et le status.

En fin de code du serveur, ajout de la gestion des erreurs survenant en dehors d'express : promesses rejetées pour fermer l'application puis le serveur proprement. Dans le controller d'erreurs, ajout d'une erreur générique pour les exceptions et erreurs inconnues.

### <ins>_Phase Authentication_</ins>

Création d'un authController pour les middlewares chargés de gérer l'authentification et la sécurisation des utilisateurs.

Amélioration de la gestion des mots de passe. Mise en place d'un mot de passe de confirmation avec validateur, et ajout d'un hook pre-save (méthodes appliquée au schéma qui se lanceront automatiquement dans la chaîne des middlewares avant chaque sauvegarde des données) pour hasher le mot de passe avec le module bcrypt.

Implémentation des json web token.

Une première fonction signToken est chargée de générer un token basé sur les informations secrètes stockées dans le fichier de config.env, et sur l'id de l'utilisateur. Elle crée également une date d'expiration sur ce même token.

Une deuxième fonction, createSendToken, récupère en paramètre un utilisateur, un status code, et envoie ce token et le cookie correspondant à l'utilisateur. J'utilise le module natif NodeMailer et j'en profite pour débuter sur MailTrap, qui permet avec un peu de configuration de "piéger" comme son nom l'indique les mails en local, pour les visualiser/traiter plus efficacement.
Si l'application est en mode production, on ajoute l'option secure sur les options du cookie pour qu'il ne soit compatible qu'avec le protocole HTTPS.

Cette fonction sendToken est ensuite utilisée pour créer plusieurs fonctionnalités liées à l'authentification de l'utilisateur : -signup pour la création d'un new user, avec des options spécifiant seulement les données autorisées nécessaires à sa création pour éviter des failles de
sécurité. -login qui récupère email et le mot de passe envoyés en requête pas l'utilisateur pour l'identifier.

J'implémente par la suite un middleware de protection d'itinéraires qu'on pourra utiliser dans les routeurs avant d'autres fonctions pour vérifier que l'utilisateur possède bien un token valide. Il check les headers pour le token, vérifie qu'il existe, utilise la fonction native verify de jwt pour l'encrypter et le comparer à celui stocké dans la base de données, vérifie que l'utilisateur existe encore et qu'il n'a pas été supprimé après la provision du token, et finalement opère encore une dernière opération pour vérifier si l'utilisateur n'a pas changé son mot de passe après la provision du même token. Si tout est Ok, il autorise l'accès et fait suivre au prochain middleware.

Pour faire echo à ce middleware, ajout d'un hook pre-save pour ajouter une date de modification de mot de passe quand celui-ci se produit, dans la bdd utilisateurs.

Configuration avancée de Postman : ajout des environnements pour le mode production et développement, et d'une variable environementale JWT pour stocker plus facilement le token après un login ou signup et gagner en fluidité sur les tests liés aux requêtes. 

Ajout des rôles à l'utilisateur et d'un middleware restrictTo pour l'empêcher d'effectuer des actions en dehors de ses permissions autorisées. 

Ajout de deux fonctionnalités de changement de mot de passe. La première se base sur l'email de l'utilisateur pour le trouver dans la bdd, supprime son mot de passe et lui envoie par mail un lien valable 10 minutes contenant un token aléatoire crypté de 32 bits pour qu'il puisse réinitialiser son mot de passe. La deuxième lui permet de modifier son mot de passe en direct si il dispose de ses identifiants corrects. 

Ajout de fonctionnalités pour mettre à jour les informations utilisateur ou le supprimer de la base de données.

## **Jour 3**<a name="jour3"></a>

### <ins>_Phase Sécurité_</ins>

Installation et configuration du module express-rate-limiter pour ajouter un limiteur de requêtes en début de chaîne sur l'application, afin de pallier à d'éventuelles "brute force attacks".

Ajout de headers HTTP avec le module helmet. Il inclut une collection de petits middlewares permettant d'améliorer la sécurité de l'application. 

Installation de mongoSanitizer, pour corriger les failles permettant des requêtes NoSQL malicieuses vouées par exemple à un utilisateur sans identifiant de prendre contrôler d'un compte admin. 

Enfin, utilisation du module hpp pour éviter la pollution des paramètres et déterminer une "whitelist" de champs autorisés en doublons lorsqu'un utilisateur faire une requête avec des fonctions de type sort().

### <ins>*Phase Modélisation des données*</ins>

*Apprentissage théorique.*

Découverte des différents patterns de modélisation des données sur la base des relations 1:1, 1:MANY, 1:TON et MANY:MANY, avantages et inconvénients des structures imbriquées ou référencées selon la situation. 

Dans le but de structurer les données en fonction des besoins de l'application, il faut identifier les cas d'utilisation, la nature des données et la relation qu'elles entretiennent entre elles.

C'est en général une bonne pratique d'opter pour des données imbriquées, surtout dans les relations 1:FEW et 1:MANY, tandis que des relations référencées seront plus adaptées pour les cas relevant du 1:TON ou MANY:MANY. 

Il est également conseillé d'utiliser le référencement quand les données sont souvent mises à jour, tandis que l'imbrication est plus adaptée lorsque les données sont souvent lues mais rarement mises à jour, ou quand deux types de données sont sont fondamentalement liées. 

Dans le cas d'utilisation de données référencées, il est nécessaire d'empêcher un tableau de références de grandir indéfiniment. Selon l'usage, on préfèrera le "parent referencing" au "child referencing" pour que ce soit la sous-donnée qui pointe vers son parent. On utilise le référencement à double sens dans les relations MANY:MANY

*Mise en application*

Dans le cas de ce projet, l'utilisateur doit pouvoir avoir accès à ses projets/devis, chaque projet contient des factures et avenants, mais les factures doivent pouvoir être accessibles facilement même en dehors des projets. 

Installation de l'extensin Drawio pour pouvoir directement créer des diagrammes sur VS-Code. Je commence à modéliser mes données, en partant sur une base de trois bases de données distinctes : Users, Projects et Bills. Le nombre de projets et de facturs étant voué à grandir de manière constante, chacun doit renvoyer à l'utilisateur en *parent referencing*. Les projets et les factures sont dans une relation à double sens, car les projets contiennent les quelques factures qui leur sont associées mais chaque facture, si prise à part, doit également pouvoir donner des informations sur le projet auquel elle est rattachée. 

L'utilisateur ne possèdera donc aucun autre ID que lui-même, tandis que les deux modèles Projets et Factures possèderont des références pointant aux deux autres bases de données. 

Transformation du drawio en PNG pour le rendre facilement accessible sur GitHub.

Création d'une troisième base de données pour les factures et du modèle correspondant. Experimentations sur le child referencing avec la requête mongoose populate().

Ajout fonctionnalités pour récupérer toutes les factures, une facture avec Id, et création d'une nouvelle facture. En addition, un hook post save sur la facture qui qui trouve le projet correspondant à la facture et ajoute cette dernière dans le tableau prévu à cet effet.

