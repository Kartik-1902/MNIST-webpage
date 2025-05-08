![Screenshot 2025-05-08 222002](https://github.com/user-attachments/assets/faa1b77a-d52c-4b4c-89de-64c5d0f22d8a)
# ✏️ Handwritten Digit Classifier

This project is a **React-based web application** that allows users to draw a digit (0–9) on a canvas and get real-time predictions from two machine learning models — **CNN** and **ResNet** — hosted on a backend server.

🧠 The backend handles ML inference while the frontend provides an intuitive and responsive drawing experience.
-[See it here](https://github.com/bismuth01/mnist-api)

---

## 🚀 Features

- 🖌️ Canvas-based digit input (mouse + touch supported)
- 📈 Predictions from **CNN** and **ResNet**
- ⌛ Smooth loading animations, including cold-start awareness
- 📊 Visual confidence indicators (animated bars)
- ✨ Sleek, futuristic UI with Tailwind CSS + animations
- 📱 Fully responsive and mobile-ready

---

## 🛠️ Tech Stack

**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Python (FastAPI) + ML models (CNN & ResNet)  
**Communication:** REST API (fetch)  
**Deployment:** Render (backend)

---

## 📦 Installation-frontend

### 1. Clone the Repository

```bash
git clone https://github.com/Kartik-1902/MNIST_webpage.git
cd MNIST_webpage/MNIST_webpage
npm install
mkdir .env-local
```
Copy this into your .env-local : 
```bash
VITE_API_BASE_URL=http://<your-backend-ip>
```
Run this command in root folder:
```bash
npm run dev
```
