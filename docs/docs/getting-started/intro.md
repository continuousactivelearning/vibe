---
title: Installation
---

This guide will help you set up ViBe on your local machine for development.

---
You can clone the repository or directly download the setup file and run it to start the setup process.
## 🚀 Clone the Repository (Optional)

```bash
git clone https://github.com/continuousactivelearning/vibe.git
cd vibe
```


## ⚙️ Setup Using Installation Scripts

ViBe uses custom scripts-`setup-unix.sh` for Unix-based systems and `setup-win.ps1` for Windows-to help initialize the development environment (both backend and frontend).

### 📦 Run the Setup

#### On Unix/Linux/macOS

```
chmod +x scripts/setup-unix.sh
./scripts/setup-unix.sh
```

#### On Windows

#### Open PowerShell as Administrator, then run:
```
cd scripts
.\setup-win.ps1
```

This script will:
- Check required dependencies
- Install backend dependencies
- Install frontend dependencies
- Set up `.env` files
- Install the CLI

> 🛠️ The script is interactive and will guide you step-by-step.

---

**Tip:**
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```  
If you encounter a security warning about running scripts, the `Set-ExecutionPolicy` command above allows you to run local scripts safely. You can revert this setting later if needed.
## 🧪 Run in Development Mode
If you want to run services manually:

### 🖥 Frontend

```bash
vibe start frontend
```

### ⚙️ Backend

```bash
vibe start backend
```

---

## 📦 Build Docusaurus (Docs)

If you're contributing to the documentation:

```bash
vibe start docs
```

Visit: `http://localhost:3000/docs`

---

## 🐛 Having Issues?

- Make sure all dependencies are installed correctly
- Open an issue or ask in the [GitHub Discussions](https://github.com/continuousactivelearning/vibe/discussions)

---

## 📚 What's Next?

- [Explore the Project Structure](./project-structure.md)
- [Understand the Architecture](../development/architecture.md)
