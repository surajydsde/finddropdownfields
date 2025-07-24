
# 🧠 Dropdown Metadata Scraper

## 📌 Overview

This automation script is designed to **scrape dropdown field options and labels from multiple web pages**, as listed in an Excel sheet. It is particularly useful for:

- ✅ QA Engineers – for automated UI metadata validation  
- 🛠 Developers – for verifying form elements dynamically  
- 🧪 Test Data Builders – for extracting clean dropdown structures  

The tool outputs a structured JSON file that contains all dropdown-related metadata per URL.

---

## 🧰 Tech Stack / Tools Used

| Tool/Library          | Purpose                                          |
|-----------------------|--------------------------------------------------|
| **Node.js**           | JavaScript runtime for executing the script     |
| **Selenium WebDriver**| Browser automation using Chrome                 |
| **ExcelJS**           | Reads `.xlsx` Excel files                       |
| **fs / path (Node)**  | File system operations                          |

---

## 📁 Folder Structure

```
📦dropdown-scraper/
├── MPPBRC.xlsx                 # Excel input file (URLs)
├── index.js              # Main script
├── filteredPageData.json      # Final dropdown metadata output
├── errorUrls.json             # URLs with errors or redirects
├── README.md                  # Documentation
└── package.json               # Dependencies
```

---

## 📝 Features

- Scrapes all `<select>` and custom combo-box dropdowns  
- Captures both `label` and all `options` (`value` and `text`)  
- Handles redirection or missing elements gracefully  
- Supports scrolling into view before interacting  
- Outputs clean structured JSON file  
- Logs failed or redirected URLs to a text file  

---

## 🧪 Dropdowns Checked

The script scans the following dropdown fields by `name`:

```js
const mentioned_dropdowns = [
  "jobtitle",
  "onlineSales",
  "monthlyonlinesales",
  "annualsales",
  "annualonlinesales",
  "organizationalrole",
  "country",
  "jobrole",
  "estimateoftotalonlinevolume",
  "estimateOfTotalOnlineVolume1",
];
```

---

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install selenium-webdriver exceljs
```

> Ensure [Google Chrome](https://www.google.com/chrome/) is installed and ChromeDriver is compatible.

### 2. Prepare Excel Input

Save all test URLs in the first column of `MPPBRC.xlsx`, starting from row 2 (row 1 is assumed to be header).

---

## 🚀 How to Run

```bash
node index.js
```

---

## 📤 Output Files

### ✅ `filteredPageData.json`

Structured dropdown data per URL:

```json
[
  {
    "pageURL": "https://example.com",
    "dropDown": {
      "jobtitle": {
        "label": "Job Title",
        "options": {
          "dev": "Developer",
          "mgr": "Manager"
        }
      }
    }
  }
]
```

### ⚠️ `errorUrls.json`

A log file listing URLs that do not contain a form:

```
[
  {
    "pageurl": "https://www.paypal.com/vn/brc/article/how-to-start-selling-internationally",
    "errorText": "form not found"
  }
]
```

---

## 🧠 How It Works (Internally)

1. Reads URLs from `MPPBRC.xlsx`
2. Opens each page with Chrome using Selenium
3. Scrolls and inspects dropdown fields defined in `mentioned_dropdowns`
4. Extracts:
   - Label (via adjacent `<label>`)
   - All options with their `text` and `value`
5. Writes clean structured data to a `.json` file
6. Tracks failed pages and writes them to a separate file

---

## 📈 Example Console Output

```
➡️ Navigating to: https://example.com
✅ Found dropdown: jobtitle
📦 Extracted 5 options
❌ Dropdown "onlineSales" not found
🚫 URL redirected to different domain
✅ Output written to filteredPageData.json
```

---

## 📌 Author

**Suraj Yadav**  
📧 Email: [surayadav.sde@gmail.com.com](mailto:surayadav.sde@gmail.com)

---

## 🧩 Potential Enhancements

- Screenshot capture of form elements
- Support for multi-page Excel and pagination
- Include checkboxes, inputs, and radio buttons
- Add support for different locales or A/B variants

---

## 📜 License

This tool is built for internal QA and development automation purposes and is not licensed for commercial use outside PayPal.

---
