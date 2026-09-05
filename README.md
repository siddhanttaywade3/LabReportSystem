# Samruddhi Clinical Laboratory Report System

An offline laboratory report management and printing application built for **Samruddhi Clinical Laboratory, Chandur Bazar**.

The system manages patients, laboratory tests, manual result entry, report completion, history, and A4 printing from a local computer.

## Features

- Register patients with name, age, gender, phone, and address
- Create draft laboratory reports
- Select one or multiple tests
- Arrange tests in the required print order
- Enter and save results manually
- Keep unfinished reports as drafts
- Complete and lock finished reports
- Search reports by patient, phone, doctor, test, or report ID
- Filter Draft and Completed reports
- Add new tests and parameters
- Activate or deactivate tests
- Print on existing preprinted letterhead
- Print a complete custom A4 letterhead
- Laboratory-themed microscope design
- Save PDFs using the patient’s name
- Run completely offline
- Start the system using one Windows batch file

## Included Test Templates

### Haemogram Report

- Haemoglobin
- Total Leucocyte Count
- Neutrophils
- Lymphocytes
- Eosinophils
- Monocytes
- Basophils
- RBC
- HCT
- MCV
- MCH
- MCHC
- RDW-CV
- RDW-SD
- Platelet Count
- MPV
- PCT
- PDW

### Hematology Report

- Blood Group & Rh Type

New tests and parameters can be added through Test Management.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Printing | Browser Print API and A4 print CSS |
| Platform | Windows |
| Operation | Offline/local network |

## Project Structure

```text
LabReportSystem/
├── backend/
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Report.js
│   │   └── Test.js
│   ├── routes/
│   │   ├── patientRoutes.js
│   │   ├── reportRoutes.js
│   │   └── testRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CompleteReport.jsx
│   │   │   ├── PatientForm.jsx
│   │   │   ├── ReportForm.jsx
│   │   │   ├── ReportHistory.jsx
│   │   │   ├── ReportPrint.jsx
│   │   │   ├── ResultEntry.jsx
│   │   │   ├── TestManagement.jsx
│   │   │   └── TestStatusManager.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── .gitignore
├── README.md
└── start-lab-system.bat
```

## Requirements

Install the following software:

- Node.js and npm
- MongoDB Community Server
- A modern browser such as Microsoft Edge, Chrome, or Brave

MongoDB must be installed as a Windows service and running locally.

## Installation

Clone the repository:

```bash
git clone https://github.com/siddhanttaywade3/LabReportSystem.git
cd LabReportSystem
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Configuration

Create a file named `.env` inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/labReportSystem
```

The `.env` file is excluded from Git and must be created separately on every computer.

## Running the Application

### One-Click Windows Startup

Double-click:

```text
start-lab-system.bat
```

It will:

1. Check whether MongoDB is running.
2. Start the backend.
3. Start the frontend.
4. Open the application in the browser.

### Manual Startup

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the application:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:5000
```

## Application Workflow

1. Register a patient.
2. Create a draft report.
3. Select the required tests.
4. Arrange tests in the required print order.
5. Enter result values manually.
6. Save the results.
7. Review the saved results.
8. Complete the report.
9. Select the print mode.
10. Print the report or save it as PDF.

Completed reports are locked against further result editing.

## Print Modes

### Plain A4 — Full Letterhead

Prints a complete report containing:

- Samruddhi Clinical Laboratory branding
- Microscope design
- Laboratory address and phone numbers
- Laboratory technician information
- Patient and report details
- Test results
- Reference ranges
- Authorized signatory area

### Preprinted Letterhead

Prints patient and report information while leaving adjustable blank space for the existing printed header and footer.

### Recommended Print Settings

- Paper size: A4
- Orientation: Portrait
- Scale: 100%
- Headers and footers: Off
- Background graphics: On for full-letterhead printing

The suggested PDF filename uses the patient’s name:

```text
Patient Name Report.pdf
```

## API Endpoints

### Patients

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/patients` | Register a patient |
| GET | `/api/patients` | List patients |

### Tests

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/tests` | Create a test |
| GET | `/api/tests` | List tests |
| PATCH | `/api/tests/:id` | Update or activate/deactivate a test |

### Reports

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/reports` | Create a draft report |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id` | View one report |
| PATCH | `/api/reports/:id/results` | Save result values |
| PATCH | `/api/reports/:id/complete` | Complete and lock a report |

## Offline Operation

The application uses MongoDB installed on the same computer.

After Node packages and MongoDB have been installed, internet access is not required. Patient data and reports remain in the local MongoDB database.

## Data Backup

GitHub stores the source code only. It does not store patient records from MongoDB.

Create regular MongoDB backups and keep them in a secure location.

## Privacy

- Do not upload the `.env` file to GitHub.
- Do not upload database backups containing patient records.
- Do not upload generated patient report PDFs.
- Protect the laboratory computer with a password.
- Allow access only to authorized laboratory staff.
- Result values must be reviewed by authorized laboratory personnel.

## Laboratory Details

**Samruddhi Clinical Laboratory**

Krushnarpan Complex, Main Road, Chandur Bazar, Dist. Amravati

**Mrs. Surekha K. Taywade**  
B.Sc., D.M.L.T.  
Registration No.: D/MLT/0009/2020

**Phone:** 9096271591 / 7588085031  
**Working Time:** 9:00 AM to 8:00 PM

## Repository

[github.com/siddhanttaywade3/LabReportSystem](https://github.com/siddhanttaywade3/LabReportSystem)

## Author

**Siddhant Kailas Taywade**
