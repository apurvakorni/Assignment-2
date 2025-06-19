# 🌦️ Weather Search Web App using Flask

This repository contains my submission for **Assignment 2** of **CSCI 571: Web Technologies**, completed as part of my graduate coursework at the **University of Southern California (USC)**.

It is a weather dashboard built using **HTML**, **CSS**, **JavaScript**, and **Flask (Python)**, deployed on **Google Cloud App Engine**.

---

## 📌 Project Overview

This is a **dynamic weather web application** that allows users to search for current and forecasted weather conditions using either:
- **IP-based geolocation**, or
- **Manual address input** (Street, City, and State)

Weather data is retrieved from the **Tomorrow.io API** and displayed in:
- An interactive **weather card**
- A **7-day forecast table**
- **Charts** for daily and hourly data using **Highcharts**

---

## 🧰 Technologies Used

- **Python** with **Flask** – Backend routing and API handling
- **HTML5, CSS3, JavaScript** – Frontend UI and interaction
- **Tomorrow.io API** – Weather data
- **Google Maps Geocoding API** – Convert address to coordinates
- **ipinfo.io** – Detect user location via IP
- **Highcharts** – Temperature & hourly forecast visualizations
- **Google Cloud App Engine** – Deployment platform
- **Git & GitHub** – Version control

---

## 📁 Project Structure

```bash
project-root/
├── app.py, main.py              # Flask backend
├── app.yaml                     # GCP deployment config
├── requirements.txt             # Python dependencies
├── static/
│   ├── styles.css
│   ├── script.js
│   └── images/                  # Weather icons and assets
└── templates/
    └── index.html               # Main HTML page





