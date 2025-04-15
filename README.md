# 🐈 Tamapi

**Tamapi** is a Tamagotchi-inspired virtual pet API that allows users to manage and interact with digital pets. Built with TypeScript and Express, this API provides endpoints for authentication, pet management, and user profile operations.

## 🚀 Overview

This API allows you to:

- Register and authenticate users
- Create, retrieve, update, and delete virtual pets
- Perform various actions on pets (e.g., feeding, playing, healing)
- Access current user profile data

## 📦 Installation

```bash
git clone https://github.com/your-username/tamapi.git
cd tamapi
npm install
```

In the project directory, you can run:

| Script  | Command         | Description                                                    |
| ------- | --------------- | -------------------------------------------------------------- |
| `dev`   | `npm run dev`   | Runs the API in development mode using `ts-node`               |
| `build` | `npm run build` | Compiles the TypeScript code into JavaScript (`dist/`)         |
| `start` | `npm run start` | Runs the compiled JavaScript code inside the `dist/` directory |

## 📚 API Endpoints

### 🔐 Auth Endpoints

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Log in and receive an access token
- `POST /auth/test-user` — Register or log in as a test user (for development)

### 🐾 Pet Endpoints

- `GET /pets` — Retrieve all pets (requires user token)
- `GET /pets/:id` — Retrieve a specific pet by ID (requires user token)
- `POST /pets` — Create a new pet (requires user token)
- `PATCH /pets/:id` — Update pet information (requires user token)
- `DELETE /pets/:id` — Delete a pet (requires user token)
- `POST /pets/:id/history` — View a pet's action history (requires user token)
- `POST /pets/:id/:action` — Perform an action on a pet (requires user token)

#### Available Actions:

- `feed` — Feed the pet
- `play` — Play with the pet
- `sleep` — Put the pet to sleep
- `clean` — Clean the pet
- `heal` — Heal the pet

### 👤 Profile Endpoints

- `GET /profile` — Retrieve the current user's profile data (requires user token)

## 📜 License

This project is licensed under the GNU General Public License v3.0.
See the [LICENSE](https://github.com/dybdeskarphet/mcfetch/blob/main/LICENSE) file for more details.
