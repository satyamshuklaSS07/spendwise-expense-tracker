# 💰 SpendWise – Interactive Expense Tracker

A modern, responsive, browser-based expense tracker built with **HTML5, CSS3 and vanilla JavaScript**. All data is stored in the browser using **LocalStorage**, so it persists after a page reload. No backend, build step or dependencies required.

## ✨ Features

- **Add expenses** with title, amount, category and date
- **Input validation** with inline error messages
- **Edit and delete** existing expenses
- **Category filter** and **date-range filter** (from / to)
- **Sorting** by date or amount (ascending / descending)
- **Live summary**: total spent, number of transactions, top category
- **Spending by category** with colour-coded progress bars
- **LocalStorage persistence**
- **Dark mode** (remembers your choice, respects system preference)
- **Toast notifications** for add / update / delete
- **Responsive UI** for desktop, tablet and mobile

## 📁 Project Structure

```
expense-tracker/
├── index.html   # Page structure
├── style.css    # Design system, theming, responsive rules
├── script.js    # App logic: CRUD, validation, filters, storage, rendering
└── README.md    # Documentation
```

## 🚀 How to Run

1. Download or clone the project.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

That's it. An internet connection is only needed to load the Inter font from Google Fonts; the app falls back to system fonts if offline.

## 🧠 How It Works

- Each expense is a JavaScript object:
  ```js
  { id: "1729330000000", title: "Groceries", amount: 850.5, category: "Food", date: "2026-10-19" }
  ```
- Expenses are stored in an array and saved to LocalStorage under the key `expense-tracker-data`.
- Filtering, sorting and totals use `Array.filter()`, `Array.sort()` and `Array.reduce()`.
- The UI re-renders dynamically after every change, with no page reload.
- Edit and Delete buttons use **event delegation** on the list container.
- User-entered text is escaped before rendering to prevent HTML injection.
- Theme preference is stored under `expense-tracker-theme`.

## 🎓 Concepts Practiced

DOM manipulation · Event listeners · Arrays & objects · LocalStorage · Form handling & validation · Filtering & sorting · Dynamic UI updates · Responsive design with CSS Grid · CSS variables & theming

## 🔧 Customisation

- **Add a category:** add an `<option>` in `index.html` (both the form and the filter) and an entry in the `CATEGORIES` object in `script.js` with an icon and colour.
- **Change colours:** edit the CSS variables at the top of `style.css`.
- **Change currency:** update the `formatMoney` function in `script.js` and the ₹ symbols in `index.html`.

## 🌐 Git & GitHub

```bash
git init
git add .
git commit -m "Add SpendWise expense tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/expense-tracker.git
git push -u origin main
```

Optional: enable **GitHub Pages** (Settings → Pages → Deploy from branch → `main`) to host it live for free.

## 🔮 Future Improvements

- Export / import data as CSV
- Monthly spending charts
- Budget limits with alerts
- Search by title

## 📄 License

Free to use for learning and personal projects.
