# IDB Training & Development Analytics Platform — Backend Documentation

## 1. Overview
This document describes the backend framwork, architecture decisions, folder structure, packages, and development guidelines for IDB Training and Analytical Platform.

### Backend Core Responsibilities

API Orchestration: Providing a robust suite of RESTful endpoints to serve as the data backbone for the React.js client.

Security & Permissions: Enforcing identity verification and managing granular Role-Based Access Control (RBAC) to ensure data integrity.

Domain Logic Management: Processing the core functional requirements of the system, including the administration of programs, participant data, financial records, and high-level analytics.

Database Interaction: Utilizing Sequelize as the ORM to facilitate structured communication and query execution with the PostgreSQL database.

## 2. Technolgy Stack

the following technologies are used in this backend:

|     Layer            |         Technology                |       Version       |     Reason
     Runtime                      Node.js                           v18+               Runs Javascript on the server
     Framework                    NestJS                            v10+               Build in structures for controllers, Services and repositories
     Language                     TypeScript                        v5+               catches errors before running thecode
     Database                     PostgreSQL                        v16               Best for structured relational data
     ORM                          Prisma                            v5+               Modern ORM with auto generated queries and clean schema file
     Authentification             JWT + HTTP only Cookies            -                 Secure Login System
     Password Hashing             bcryptjs                          v2.4+             Encrypts passwords before saving
     Validation                   Class Validator                    -                 Check incoming data is correct
     Containerization             Docker                             -                 Runs the app consistnetly on any machine
     VErsion Control              Git/GitHub                         -                 Saves code History and enables team work


## Why NestJS over ExpressJS

    NestJS was chosen over Express.js for the following Reason:

        Feature                            Express.js                                     NestJS 
 
      Structure                     Manual — you build it yourself       Built-in modules, controllers, services |
      TypeScript                    Optional                             Default 
      Repository pattern            Manual setup required                Built-in with Prisma 
      Validation                    Manual                               Built-in with class-validator 
      Scalability                   Hard to maintain as project grows    Designed to scale 
      Fits project requirement      Partially                            Perfectly 


NestJS was selected because the project requires models, repositories, services and APIs as seperate Layers.
NEstJS enforces this structure by design, making the codebase clean, consistent, and easy to maintain across the team.


## Layered Architecture

Every feature in the backend follows this strict layered pattern:

    ...
            HTTP Request
                 |
                 v
             Controller   ->   Handles HTTP request and Response
                 |
                 v
              Service     ->   Contains all business logic
                 |
                 V
             Repository   ->   Communities with the database
                 |
                 V
             Prisma ORM   ->   Transaltes to SQL Queries
                 |
                 v
             PostgreSQL DB  ->  Stores the data
    ...


| Layer               |  File                 |  Resposibility
 controller              *.controller.ts          REcieves request, calls services, return response
 Service                 *.Service.ts             Business Logic, Validation rules, Calculations
 Repository              *.repository.ts          Databse Queries - find, save, update , delete
 Module                  *.module.ts              Wires everything together
 DTO                     *.dto.ts                 Defines the shape of incoming data


 ## 5. Row version  - OPtimistic concurrency Control

 Every table in  the databse must include a rowVersion column. This is considered mandatory  for this project

 ### What it is?
 Row version is a number that increments by 1 evevrytime a record is updated. BEfore updating the system check whetehr the rowVersionin the request matches the rowVersion in the database.If they do not match it means that someone else has already updated the record and request  is rejected.

 ### Why it is needed?
 Prevents two users from overwriting each other's changes at the same time.


 ## Authentication Flow - HTTP-onyl cookies

 Authentication uses JWT tokens stored in HTTP-only Cookies. Tokens are NOT stored in localStorage or Authorization headers.

 ### Why HTTP - Only cookies?

Cookie Flag                     Purpose
HTTP only                        JAvascript cannot read the cookie - prevenst XSS Attacks
Secure                           Cookies is only sent over HTTPS
SameSite= Strict                 cookies not sent with cross-site requests - prevents CSRF attacks

### Login Flow - Step by Step

1. The user send POST /api/auth/login with email and password
2. Backend finds the user by email in the database
3. Backend compares entered password with hashed passswed in the database
4. If match 
      Then generate JWT Token
5. Return token inside set-cookie header with HttpOnly, Secure, SameSite flags
6. Browser stores the cookie automatically
7. Every request after that sends the cookie and validates it
8. Auth middleware reads token from cookie and validates it
9. If Valid 
      Attach user to request aand allow access
10. POST/api/auth/logout Clears cookie


## 7.API Conventions

### BaseURL

...
   http://localhost:3000/api
...

### Endpoint Naming

...

   GET    /api/users           → Get all users (paginated)
   GET    /api/users/:id       → Get one user
   POST   /api/users           → Create a new user
   PUT    /api/users/:id       → Update a user
   DELETE /api/users/:id       → Delete a user
   POST   /api/auth/login      → Login
   POST   /api/auth/logout     → Logout
   GET    /api/auth/me         → Get currently logged in user

...

### Pagination, Search and Filter

All GET list endpoints must support pagination, search and filter.

|       Parameter            |           Type            |           Description
        Page                        Number                      Page number - default 1
        limit                       Number                      Items per page - default 10
        Search                      String                      Search by name or email
        role                        String                      Filter by role
        District                    String                      Filter by district
        Status                      String                      Filter by active or inactive


###  Standard Response Format

...
{
   "Success": True
   "Message": "Users retrieved Successfully"
   "Data": []
   "Meta": {
   "Page":1,
   "Limit": 10,
   "Total": 100,
   "Total Pages": 10
   }
}
...


## Environmental Variable

copy.env.example to .env and fill in your values.
never commit the .env file to Git as it contains sensitive information.

...
    SERVER
        PORT = 3000
        NODE_ENV = Development
    
    PostreSQL Database
        DB_HOST = localhost
        DB_PORT = 5432
        DB_NAME = idb_platform
        DB_USER = postgres
        DB_PASSWORD = your_postgresql_password_here

    JWT

        JWT_SECRET = 
        JWT_EXPIRES_IN = 7d

    Frontend URL
        CLIENT_URL = http://localhost:5173
...


|           Variable            |           DEscription         
              PORT                      Port that the server runs on - default = 3000
              NODE_ENV                  Environment - development or production
              DB_HOST                   Database host - localhosy foe local machine
              DB_PORT                   Postgresql port - default 5432
              DB_NAME                   NAme of the Postgresql database
              DB_USER                   PostgreSQL username
              DB_PASSWORD               PostgreSQL PAssword
              JWT_SECRET                Secret key used to sign JWT Tokens
              JWT_EXPIRES_IN            How long the token lasts
              CLIENT_URL                React frontend URL for CORS


 ## How to setup and run

 ### Prerequisites
    Node.js v18+
    PostgreSQL v16
    Deocker Desktop
    Git
    Postman

 ### Steps

 ...
    Step 1: Clone the repository git clone <repository URL>cd idb-platform
    Step 2: Intall dependecies
            npm install
    Step 3: Setup environmental variables
            cp.env.example.env
            Open .env and fill in your PostgreSQL password and JWT secret
    Step 4 — Create the database in PostgreSQL
            CREATE DATABASE idb_platform;
    Step 5 — Run Prisma migration
            npx prisma migrate dev
    Step 6 — Start the server in development mode
            npm run start:dev
    Step 7 — Verify it is running
            Open browser and go to http://localhost:3000
 ...

 ### Running with Docker

 ...
    Start all containers
        docker-compose up --build
    Stop all containers
        docker-compose down
...


## 10.Git Wirkflow

### Branch Structure
...
        main                                  → stable production code only
            └── develop                       → main development branch
            ├── feature/T006-user-model
            ├── feature/T007-auth
            └── fix/T006-user-pagination

...

### Commit message convention

...
    Feat: add user entity with row version
    fix:  Correct password hashing in user services
    docs: Update backend documentation
    test: add unit tests for user services
...

### Rules

- never commmit directly to the main
- Always create a brach for every task
- Always write a clear commit the .env file



----
 *Document maintained by Backend Team Last updates: 17.03.2026*
