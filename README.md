📅 EasyBooking – Application Fullstack (Node.js + React + MongoDB)

EasyBooking est une mini application web permettant la gestion de réservations de salles.

Projet réalisé dans le cadre d’un TP EFREI (NoSQL / Fullstack).

🚀 Fonctionnalités

Création de compte utilisateur

Authentification (JWT)

Consultation de la liste des salles disponibles

Réservation d’une salle sur un créneau horaire (start / end)

Blocage des chevauchements de réservations

Consultation des réservations personnelles (“Mes réservations”)

🧱 Architecture technique

Backend : Node.js / Express

Frontend : React

Base de données : MongoDB

Authentification : JWT

Tests :

Unitaires : Jest

Intégration & Sécurité : Supertest

Performance : k6

⚙️ Prérequis

Avant de lancer le projet, assurez-vous d’avoir installé :

Node.js (v18+ recommandé)

MongoDB (local ou via MongoDB Atlas)

npm

k6 (pour les tests de performance)

Installation de MongoDB (local)

https://www.mongodb.com/try/download/community

Installation de k6

Windows (Chocolatey) :

choco install k6


Autres OS :
https://k6.io/docs/get-started/installation/

📦 Installation du projet
1️⃣ Cloner le projet
git clone <url-du-repo>
cd EasyBooking

2️⃣ Installation du backend
cd backend
npm install


Lancer le backend :

npm start


Le serveur API démarre sur :

http://localhost:4000

3️⃣ Installation du frontend
cd ../frontend
npm install
npm start


Le frontend démarre sur :

http://localhost:3000

🧪 Lancer les tests
Tests unitaires / intégration / sécurité

Depuis le dossier backend :

npm test

Tests de performance (k6)

Toujours dans backend :

k6 run tests/perf/k6_rooms.js
k6 run tests/perf/k6_mix.js


Ces tests simulent plusieurs utilisateurs simultanés et vérifient :

le temps de réponse

la stabilité fonctionnelle

la tenue sous charge

🧑‍💻 Utilisation de l’application

Créer un compte utilisateur

Se connecter

Consulter les salles disponibles

Réserver une salle sur un créneau horaire

Visualiser ses réservations personnelles

📊 Qualité & validation

Le projet inclut :

Tests unitaires

Tests d’intégration

Tests de sécurité

Tests de performance

L’ensemble des tests permet de valider la stabilité, la sécurité et la performance de l’application.

🏫 Contexte académique

Projet réalisé dans le cadre d’un TP EFREI
Thématique : NoSQL / Fullstack / Qualité logicielle
