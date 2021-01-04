## *Projet de stage de Nassim Fernane du 04/01/2021 au 29/01/2021*

# Table des matières
1. [Objectifs du projet](#objectifs)
2. [Fonctionnement et description du site](#description)
3. [Organisation du code](#organisation)
4. [Journal de bord](#journal)

## **OBJECTIFS DU PROJET <a name="objectifs"></a>**

- Maquetter les interfaces de saisies et de consultations. 
- Création d’une base de données. 
- Création d’une application web (framework à définir). 
- Création d’une API REST (Node.js). 
- Opération CRUD sur
- la base de données (via l’API).
- Publication de front-end et back-end sur un serveur de production.
- Réalisation de tests fonctionnels.

## **FONCTIONNEMENT ET DESCRIPTION DU SITE <a name="description"></a>**

### Page 1 ###
...
### Page 2 ###
...

## **ORGANISATION DU CODE<a name="organisation"></a>**

## **JOURNAL DE BORD<a name="journal"></a>**

Définition du projet et de ses objectifs. 

Distinction des problématiques et choix technologiques en conséquence.

Création du projet sur VS-Code et mise en place des outils de travail : Installation de Node.js et Express pour la gestion du back-end, puis de MongoDB et Mongoose pour la base de données. Ajout de compass en tant qu'interface graphique, et Postman pour gérer les tests de requêtes au serveur. 

Initialisation du projet sur Git et mise en relation sur Github. Installation des outils de formatage du code (eslint, prettier) puis configuration de leur spécificités dans un fichier dédié, afin d'uniformiser les pratiques et rendus pour d'éventuels futurs collaborateurs.

Côté front-end, installation du framework CSS Sass et première ébauche de son architecture basée sur le pattern 7-1.

Fondations du Back-End:

Premiers pas dans les fondations du back-end. Je découvre Express et ses premières fonctionnalités pour structurer une application Node. Création du serveur en local, et d'un fichier de configuration pour les variables environementales. Celui-ci me servira à gérer les données sensibles et tout ce qui touche à la connexion et l'authentification sur les différents services (base de donnée, web tokens, identifiants de mailing, etc.). Je définis un port par défaut (en plus de celui choisi dans le fichier config), et un écouteur sur ce dernier afin de log la connexion et le port. Création d'un fichier gitignore pour garder le fichier de configuration en local pour des raisons évidentes de sécurité.

Phase d'apprentissage : Expérimentation sur les premiers modules, premières opérations CRUD en local avec le module File System et tests sur leur variantes asynchrones. Premier bain dans les templates construits à partir des resultats d'un fichier Json, toujours en local. A terme, les templates seront nourris par les résultats de notre API Rest. 

J'expérimente et je met également en place les premiers routeurs qui serviront les requêtes vers les bases de données pour les utilisateurs et leurs projets/devis. Première difficulté : visualiser clairement le chemin fonctionnel de l'application et de ses différentes ramifications.  L'application est factorisée dans son propre fichier, mais requise dans le serveur.js qui se chargera à terme de faire le pont avec la base de données. L'application, de son côté, importe ses propres modules et middlewares qui serviront à tracer des jalons successifs : en effet, une application express répond à une requête par un chemin de middlewares, petites fonctions intermédiaires qui définiront chacun à leur tour le comportement de notre application selon la requête soumise par l'utilisateur. A cette occasion j'apprends à importer un middleware, mais aussi à en créer de toutes pièces. 

Début de la construction de l'API : gestion basique des requêtes GET, POST, PATCH, et DELETE pour pallier à nos premiers besoins de persistance des données. Je paramètre Postman pour éprouver chacune des requêtes. Ce dernier est très utile pour simuler des requêtes très précises par navigateur, sauvegarder ces requêtes et les organiser pour tester efficacement notre API. A cette occasion j'implémente/factorise grâce à Express des routeurs séparés pour les utilisateurs et les projets, afin de les dissocier dans des fichiers séparés qui accueilleront leur modules, et la définition de chacun des itinéraires qui desserviront les deux bases de données.

J'approndis davantage mes connaissances sur les middlewares en experimentant sur les paramètres (comme par exemple un iténaire /:id pour les utilisateurs) et en apprenant comment enchaîner différents middlewares à la suite. 

Introduction à MongoDB :
