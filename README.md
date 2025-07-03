Mental Health in Tech Dashboard
Overview
This project is an interactive dashboard visualizing mental health survey data from tech industry employees in 2014, focusing on U.S. respondents. It uses HTML, JavaScript (D3.js), Tailwind CSS, and a cleaned CSV dataset (mental_health_cleaned.csv). The dashboard features six charts to explore mental health trends, with interactive filters and responsive design.
Prerequisites
To run the application locally, ensure you have:

A modern web browser (e.g., Chrome, Firefox, Edge).
A local web server (e.g., Python’s http.server, Node.js’s http-server, or VS Code Live Server extension).
The project files organized in the following structure:mental-health-dashboard/
├── css/
│   └── style.css
├── data/
│   └── mental_health_cleaned.csv
├── js/
│   └── main.js
├── index.html
└── README.md



Setup Instructions

Clone or Download the Repository:

Clone the repository or download the project files to your local machine.
Ensure all files (index.html, css/style.css, js/main.js, data/mental_health_cleaned.csv) are in the correct directory structure.


Host the Application:

Due to browser security restrictions, you cannot run the dashboard by opening index.html directly (it won’t load the CSV file). Instead, use a local web server:
Python: Navigate to the project directory and run:python -m http.server 8000

Then open http://localhost:8000 in your browser.
Node.js: Install http-server globally (npm install -g http-server), then run:http-server

Open http://localhost:8080 in your browser.
VS Code: Use the Live Server extension to serve the project.


Alternatively, deploy the files to a web server (e.g., GitHub Pages, Netlify).


Verify Dataset:

Ensure data/mental_health_cleaned.csv exists and contains the expected columns: Timestamp, Age, Gender, Country, state, treatment, remote_work, no_employees, mental_health_consequence, family_history, supervisor, benefits, care_options.
The dataset should be preprocessed with numeric encodings (e.g., Gender: 1=Male, 0=Female, others=Other; treatment: 1=Yes, 0=No).



Running the Application

Open your browser and navigate to the server URL (e.g., http://localhost:8000).
The dashboard will load, displaying:
A header with the title and description.
Filter controls for Gender, Age, and Remote Work.
Six charts: Bar Chart (Treatment by Gender), Histogram (Age Distribution), Grouped Bar Chart (Treatment by Work Location), Stacked Bar Chart (Mental Health Consequences by Company Size), Pie Chart (Treatment by Family History), Grouped Bar Chart (Supervisor Support by Company Size), and Heatmap (Treatment by Benefits and Care Options).


Interact with the dashboard:
Use the dropdowns (Gender, Remote Work) and slider (Age) to filter data.
Hover over chart elements for tooltips with detailed information.
Click bars or bins in Charts 1, 2, or 3 to update filters dynamically.
Resize the browser window to test responsive design.



Troubleshooting

Charts Not Loading: Check the browser console (F12 > Console) for errors. Ensure mental_health_cleaned.csv is in the data/ folder and accessible.
CORS Errors: If you see errors about loading the CSV, ensure you’re using a web server, not opening index.html directly.
Missing Visuals: Verify that css/style.css and js/main.js are correctly linked in index.html. Ensure D3.js and Tailwind CSS are loaded via their CDNs.
Data Issues: If charts show unexpected data, log the loaded data in main.js (console.log("Loaded Data:", data)) to verify column names and values.

Dependencies

D3.js: Loaded via CDN (https://d3js.org/d3.v7.min.js).
Tailwind CSS: Loaded via CDN (https://cdn.tailwindcss.com).
Google Fonts (Inter): Loaded via CDN for consistent typography.

Authors

Sabeen Zehra (FA22-BDS-036)
Esha Raza (FA22-BDS-010)
