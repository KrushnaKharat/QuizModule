# Quiz Module – Full Stack Quiz App

## 📚 Introduction

**Quiz Module** is a full-stack web application for managing and taking quizzes, designed for educational institutions and online learning platforms. It features user authentication, admin management, course and topic assignment, quiz attempts, and score tracking. The project is built with a modern tech stack and is easy to set up and extend.

---

## 🛠️ Technologies Used

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **Other:** Axios (API calls), bcryptjs (password hashing)

---

## 🚀 Features

- User and Admin authentication
- Admin dashboard for managing users, courses, topics, and questions
- Assign courses to users
- Users can view and attempt quizzes only for assigned courses
- Score tracking and attempt limits
- Responsive UI with Tailwind CSS

---

## 📦 Folder Structure

```
quiz-frontend/      # React frontend
quiz-app-backend/   # Node.js/Express backend
```

---

## ⚡ Getting Started

### 1. **Clone the Repository**

```sh
git clone https://github.com/KrushnaKharat/QuizModule
cd QuizModule
```

### 2. **Setup the Database**

- Create a MySQL database (e.g., `quiz_app`).
- Import the schema from:
  ```
  quiz-app-backend/models/dbTables.sql
  ```
- Update your database credentials in:
  ```
  quiz-app-backend/config/db.js
  ```

### 3. **Backend Setup**

```sh
cd quiz-app-backend
npm install
# Configure your .env or data.env for DB connection if needed
npm start
```
- The backend will run on [http://localhost:5000](http://localhost:5000)

### 4. **Frontend Setup**

```sh
cd quiz-frontend
npm install
npm start
```
- The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage

- **Admin Login:** Create an admin user in the database or via the UI.
- **Admin Panel:** Manage users, assign courses, add topics and questions.
- **User Login:** Users see only their assigned courses and can attempt quizzes.
- **Logout:** Secure logout for both users and admins.

---

## 🔍 SEO & Discoverability

- **Keywords:** quiz app, react quiz, node quiz, online quiz platform, education, admin dashboard, course assignment, full stack quiz, MySQL quiz app
- **Description:** A full-featured quiz platform with admin and user roles, course assignment, and secure authentication, built with React, Node.js, and MySQL.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Get started and build your own quiz platform today!**
