# 🤖 AI-Based Code Review Assistant

An AI-powered web application that analyzes uploaded source code and provides intelligent feedback to improve code quality. The system detects syntax errors, coding issues, security risks, performance bottlenecks, and best-practice violations using Google's Gemini AI. It offers a modern interface with secure authentication, review history, and downloadable PDF reports.

---

## 🚀 Features

* 🔐 User Registration & Login
* 🤖 AI-powered code review using Gemini API
* 📂 Upload source code files
* 🐞 Detect syntax errors and coding issues
* 🔒 Identify basic security vulnerabilities
* ⚡ Suggest performance improvements
* 📖 Recommend coding best practices
* 📊 Overall code quality score
* 📄 Download review reports as PDF
* 🕒 Review history dashboard
* 👤 User profile management
* 🌙 Responsive modern UI with Dark/Light Mode

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript

### Backend

* Python
* Flask

### Database

* SQLite
* SQLAlchemy

### AI Integration

* Google Gemini API

### Libraries

* Flask-Login
* Flask-WTF
* ReportLab
* Pygments
* Pandas

---

## 📂 Project Structure

```text
AI_Code_Review_Assistant/
│
├── app.py
├── config.py
├── requirements.txt
├── README.md
├── database.db
│
├── models/
├── services/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── templates/
│
├── uploads/
├── reports/
└── utils/
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-Code-Review-Assistant.git
cd AI-Code-Review-Assistant
```

### 2. Create a virtual environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the Gemini API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=YOUR_API_KEY
SECRET_KEY=YOUR_SECRET_KEY
```

### 5. Run the application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

## 📋 How It Works

1. Register or log in.
2. Upload a supported source code file.
3. The application sends the code to the Gemini API.
4. AI analyzes the code for syntax errors, code quality, security, and performance.
5. A detailed review report with suggestions and an overall score is displayed.
6. Users can download the report as a PDF and view previous reviews.

---

## 📸 Screenshots

Add screenshots here after completing the project.

* Home Page
* Login Page
* Dashboard
* Upload Page
* AI Review Report
* Review History
* Admin Dashboard

---

## 📈 Future Enhancements

* Support more programming languages
* GitHub repository integration
* Team collaboration
* AI chat assistant for code fixes
* Code comparison and duplicate detection
* CI/CD integration
* Email notifications
* Advanced analytics dashboard

---

## 🤝 Contributing

Contributions are welcome. Fork the repository, create a feature branch, make your changes, and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Vaishnavi Bommisetty**

Final Year B.Tech (Computer Science & Engineering)

---

⭐ If you found this project useful, consider giving it a star on GitHub!
