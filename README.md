

# MERN Full Stack App (Vite + Express)

This is a full-stack MERN application using **Vite + React** for the frontend and **Node.js + Express** for the backend.  
The project follows a clean client–server separation and is fully compatible with **Windows**.

---

## 📁 Project Structure

```

mern-app/
├── client/        # Vite + React frontend
├── server/        # Express backend
├── .gitignore
└── README.md

````

---

## 🚀 Tech Stack

### Frontend
- React
- Vite
- JavaScript / TypeScript

### Backend
- Node.js
- Express
- CORS
- dotenv

### Dev Tools
- Nodemon
- Concurrently (optional)

---

## ✅ Prerequisites

Ensure the following are installed:

- Node.js (v18+ recommended)
- npm
- Git
- Windows 10 / 11

Check versions:
```bash
node -v
npm -v
````

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/saralaufeyson/Artopus-Ecom

```

---

### 2️⃣ Frontend Setup (Vite + React)

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

### 3️⃣ Backend Setup (Express)

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## 🔁 Frontend ↔ Backend Proxy

Vite is configured to proxy API calls to the backend.

Example:

```js
fetch("/api/health")
```

This forwards automatically to:

```
http://localhost:5000/api/health
```

---

## 🧪 Test Backend API

Open browser or Postman:

```
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "Backend running 🚀"
}
```

---

## 🔥 Run Frontend & Backend Together (Optional)

From the **root folder**:

```bash
npm install
npm run dev
```

This uses **concurrently** to start:

* React (Vite)
* Express (Nodemon)

---

## 📄 Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

> ⚠️ `.env` files are ignored by git for security.

---

## 🧹 Git Ignore

The project ignores:

* `node_modules`
* `.env` files
* build outputs
* logs
* OS & editor files

See `.gitignore` in the root folder.

---

## 📦 Future Enhancements

* MongoDB + Mongoose integration
* JWT Authentication
* Role-based access control
* Docker support
* CI/CD pipeline

---

## 👤 Author

**Layasree**
Full Stack Developer | MERN | Cybersecurity Enthusiast

---

## 📜 License

This project is licensed under the MIT License.

```

If you want, I can:
- Make this **resume / GitHub showcase optimized**
- Add **API docs section**
- Add **deployment steps (Vercel + Render)**
- Convert it to a **company-grade README**

Just say the word 🚀
```
