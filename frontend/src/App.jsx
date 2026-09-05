import { useEffect, useState } from "react";
import "./App.css";
import PatientForm from "./components/PatientForm";
import ReportForm from "./components/ReportForm";
import ResultEntry from "./components/ResultEntry";
import CompleteReport from "./components/CompleteReport";
import ReportPrint from "./components/ReportPrint";
import TestManagement from "./components/TestManagement";
import ReportHistory from "./components/ReportHistory";

const API_URL = "http://localhost:5000/api";

function App() {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const responses = await Promise.all(
          ["patients", "tests", "reports"].map((endpoint) =>
            fetch(`${API_URL}/${endpoint}`, {
              signal: controller.signal,
            })
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to load dashboard data.");
        }

        const [patientData, testData, reportData] =
          await Promise.all(
            responses.map((response) => response.json())
          );

        setPatients(patientData);
        setTests(testData);
        setReports(reportData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Unable to load data. Check that the backend is running on port 5000."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, []);

  const activeTests = tests.filter((test) => test.isActive);

  function updateReport(updatedReport) {
    setReports((previous) =>
      previous.map((report) =>
        report._id === updatedReport._id ? updatedReport : report
      )
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">S</div>

            <div>
              <h1>Samruddhi Clinical Laboratory</h1>
              <p>Patient records & laboratory reports</p>
            </div>
          </div>

          <span className="location">Chandur Bazar</span>
        </div>
      </header>

      <main className="main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">LABORATORY OVERVIEW</p>
            <h2>Dashboard</h2>
          </div>

          <span className="date">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {loading ? (
          <div className="message">Loading dashboard...</div>
        ) : error ? (
          <div className="message error" role="alert">
            {error}
          </div>
        ) : (
          <>
            <section className="stats">
              <div className="stat-card">
                <span>Total Patients</span>
                <strong>{patients.length}</strong>
              </div>

              <div className="stat-card">
                <span>Active Tests</span>
                <strong>{activeTests.length}</strong>
              </div>

              <div className="stat-card">
                <span>Total Reports</span>
                <strong>{reports.length}</strong>
              </div>

              <div className="stat-card">
                <span>Draft Reports</span>
                <strong>
                  {
                    reports.filter(
                      (report) => report.status === "Draft"
                    ).length
                  }
                </strong>
              </div>
            </section>

            <PatientForm
              onPatientAdded={(patient) => {
                setPatients((previous) => [patient, ...previous]);
              }}
            />

            <ReportForm
              patients={patients}
              tests={tests}
              reports={reports}
              onReportCreated={(report) => {
                setReports((previous) => [report, ...previous]);
              }}
            />

            <ResultEntry
              reports={reports}
              onReportSaved={updateReport}
            />

            <CompleteReport
              reports={reports}
              onReportCompleted={updateReport}
            />

            <ReportPrint reports={reports} />
            <ReportHistory reports={reports} />

            <section className="panel">
              <div className="panel-heading">
                <h3>Recent Reports</h3>
                <span>Latest 5 reports</span>
              </div>

              {reports.length === 0 ? (
                <p className="empty">No reports created yet.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Tests</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.slice(0, 5).map((report) => (
                        <tr key={report._id}>
                          <td>
                            {report.patient?.name ||
                              "Patient unavailable"}
                          </td>

                          <td>
                            {report.tests
                              .map((test) => test.testName)
                              .join(", ")}
                          </td>

                          <td>
                            {new Date(
                              report.reportDate
                            ).toLocaleDateString("en-IN")}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                report.status === "Completed"
                                  ? "completed"
                                  : "draft"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <TestManagement
              onTestAdded={(test) => {
                setTests((previous) =>
                  [...previous, test].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  )
                );
              }}
            />

            <section className="panel">
              <div className="panel-heading">
                <h3>Available Tests</h3>
                <span>{activeTests.length} active</span>
              </div>

              {activeTests.length === 0 ? (
                <p className="empty">No active tests available.</p>
              ) : (
                <div className="test-grid">
                  {activeTests.map((test) => (
                    <div className="test-card" key={test._id}>
                      <h4>{test.name}</h4>

                      <p>
                        {test.parameters.length} parameters
                        {" · "}
                        {test.sampleType || "Sample unspecified"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;