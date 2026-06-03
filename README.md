<div dir="rtl" align="right">

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="80" height="80" alt="React Logo" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" width="80" height="80" alt="Java Logo" />
</p>

<h1 align="center">🏎️ MATH RACE - מרוץ הלמידה הגדול</h1>

<p align="center">
  <b>הופכים את לימודי המתמטיקה לחוויית מולטיפלייר תחרותית וסוחפת בזמן אמת! 🏁</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
</p>

<br />

## 🚀 על הפרויקט

**MATH RACE** היא פלטפורמה חינוכית מהדור החדש, המשלבת למידה אקדמית עם משחקיות מתגמלת (Gamification). הפרויקט לוקח את המשימה השגרתית של פתרון תרגילי מתמטיקה והופך אותה למרוץ מכוניות מלא אדרנלין. 

השחקנים מתחרים זה בזה במסלול מרוצים רווי אקשן בעיצוב **רטרו-ניאון**, כאשר ההתקדמות, המהירות והניצחון תלויים ביכולתם לפתור תרגילים באופן מהיר ומדויק אל מול אתגרים, בחירות נתיב ואירועי מזל מפתיעים.

### 👨‍💻 צוות הפיתוח
הפרויקט פותח ועוצב מאפס על ידי צוות שתמיד מכוון להכי גבוה שיש (עם הרבה חוש הומור בדרך):
* **מנשה ישכיל** (Lead Full-Stack Developer)
* **דוד מאיר כהן** (Full-Stack Developer)
* **אברהם רייס** (Full-Stack Developer)

---

## ✨ פיצ'רים מרכזיים

* ⏱️ **מולטיפלייר בזמן אמת (Real-Time):** טכנולוגיית **SSE (Server-Sent Events)** מבטיחה סנכרון חלק ומיידי של מיקומי הרכבים, מצב המרוץ והניקוד של כל המשתתפים ללא ריענון עמוד.
* 🧠 **מחולל שאלות דינמי (Dynamic Generator):** מנוע אלגוריתמי המייצר שאלות מתמטיות בזמן אמת כדי להבטיח גיוון מוחלט – שום מרוץ אינו זהה לקודמו.
* 🎲 **אירועי מזל ופיצולים (Branching & Luck):** אסטרטגיה היא חלק מהמשחק. בחירת נתיבים במסלול והתמודדות עם הפתעות קוד משנות את הדינמיקה והחוקים תוך כדי תנועה.
* 🎨 **עיצוב ארקייד-ניאון (Neon UI):** חוויית משתמש (UX/UI) עוצרת נשימה עם רכבים מותאמים אישית, רקעי ניאון מונפשים, פופ-אפים ואפקטים ויזואליים עשירים.
* 👨‍🏫 **דשבורד מורה (Teacher Dashboard):** פאנל ניהול מתקדם למורים המאפשר פתיחת חדרים, הגדרת פרמטרים למרוץ, ומעקב אחר תוצאות והתקדמות התלמידים ב-Leaderboard המפורט.

---

## 🛠️ ארכיטקטורה וטכנולוגיות

המערכת פותחה בארכיטקטורת **Client-Server** מודרנית, תוך הקפדה על קוד נקי, מודולריות, והפרדת עניינים (Separation of Concerns):

### 🖥️ צד לקוח (Frontend)
* מבוסס על **React.js** תוך שימוש ב-**Vite** לזמני טעינה וביצועים מקסימליים.
* בנוי מקומפוננטות UI מודולריות (כגון `RaceTrack`, `QuestionCard`, `TimerDisplay`).
* עיצוב מבוסס CSS טהור עם משתני סביבה מתקדמים לאפקטי הניאון הייחודיים.

### ⚙️ צד שרת (Backend)
* כתוב ב-**Java 17** בשילוב התשתית העוצמתית של **Spring Boot**.
* לוגיקת משחק מורכבת מנוהלת דרך Services ייעודיים (`ScoringService`, `LuckEventService`, `BranchingService`).
* עבודה מול בסיס נתונים באמצעות **Hibernate / JPA**.
* ניהול תעבורת רשת רציפה (Broadcasting) למספר רב של קליינטים בו-זמנית בעזרת `SseConnectionManager`.

---

## 🏁 הרצה מקומית (Getting Started)

כדי להתקין ולהריץ את הפרויקט על סביבת הפיתוח המקומית שלכם, עקבו אחר השלבים הבאים:

### דרישות מערכת
* `Java JDK 17+`
* `Node.js (v18+)` & `npm`
* `Maven`

### 1. הרצת צד השרת (Backend)
פתחו את הטרמינל, נווטו לתיקיית הפרויקט והריצו:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*(השרת יאזין כברירת מחדל על פורט 3000)*

### 2. הרצת צד הלקוח (Frontend)
בטרמינל נפרד, הריצו את הפקודות הבאות:
```bash
cd frontend
npm install
npm run dev
```
*(היכנסו לכתובת `http://localhost:xxxx` בדפדפן והתחילו להתחרות!)*

---
<p align="center">
  <b>פותח באהבה ובקוד פתוח 💻 | פרויקט MATH RACE 2026 ©</b>
</p>

</div>
