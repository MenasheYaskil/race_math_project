# Math Race / Innovative Learning Race

A real-time, interactive, gamified math racing game. Students answer math questions to progress on a visual race track, utilizing dynamic decision meters, branching paths (Highway / Dirt Road), and freeze/hint mechanics. Teachers create, start, and monitor races live via an SSE-powered real-time dashboard.

---

## 🛠️ Tech Stack & Requirements

### Backend
* **Language & Framework:** Java 17, Spring Boot 3.1.2
* **Build Tool:** Maven 3.x
* **Database:** In-memory H2 Database (with pre-seeded math templates and teacher credentials)
* **API / Real-time:** REST APIs + Server-Sent Events (SSE)

### Frontend
* **Core:** React, Javascript
* **Build Tool & Dev Server:** Vite
* **Styling:** Premium Vanilla CSS (neon gradients, responsive layouts, glassmorphism animations)

---

## 🚀 Run Instructions

### 1. Backend Service
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and compile the project:
   ```bash
   mvn clean compile
   ```
3. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
* The backend will run on **`http://localhost:8080`**.
* The **H2 Console** is accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:testdb`, Username: `sa`, Password: *empty*).
* A default teacher account is pre-seeded:
  * **Username:** `teacher`
  * **Password:** `password123`

### 2. Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
* The frontend client will run on **`http://localhost:5173`** (or another port as displayed in your terminal).
* To compile a production-ready bundle, run:
   ```bash
   npm run build
   ```

---

## 🏁 Manual Demo Checklist

Follow these steps to experience the full interactive product flow:

- [ ] **Step 1:** Start the Spring Boot backend (`mvn spring-boot:run`).
- [ ] **Step 2:** Start the Vite frontend dev server (`npm run dev`).
- [ ] **Step 3:** Open your browser and navigate to `http://localhost:5173/teacher/login`.
- [ ] **Step 4:** Log in using username **`teacher`** and password **`password123`**.
- [ ] **Step 5:** Create a new race by setting a name and clicking **"Create Race"**. Note the generated **Room Code**.
- [ ] **Step 6:** In a separate browser window or an Incognito tab, go to `http://localhost:5173/student/join`.
- [ ] **Step 7:** Enter the **Room Code** and a nickname, and click **"Join"** to join the lobby.
- [ ] **Step 8:** Confirm that the student's nickname immediately appears on the teacher's lobby screen in real-time.
- [ ] **Step 9:** Click **"Start Race"** from the teacher's lobby page.
- [ ] **Step 10:** On the student page, answer math questions as they arrive. Verify that answering correctly advances the student's racer on the shared track.
- [ ] **Step 11:** Verify the teacher's live dashboard (`/teacher/dashboard/<id>`) receives real-time progress updates via SSE.
- [ ] **Step 12:** Click **"Finish Race"** from the teacher's dashboard.
- [ ] **Step 13:** Confirm both screens transition to their respective **Results / Leaderboard** screens, displaying correct participant standings.
"# math_race_project" 
"# race_math_project" 
