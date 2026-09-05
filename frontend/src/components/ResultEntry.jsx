import { useRef, useState } from "react";

function ResultEntry({ reports, onReportSaved }) {
  const [selectedId, setSelectedId] = useState("");
  const [values, setValues] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  const draftReports = reports.filter(
    (report) => report.status === "Draft"
  );

  const selectedReport = reports.find(
    (report) => report._id === selectedId
  );

  function selectReport(event) {
    const id = event.target.value;

    if (
      dirty &&
      !window.confirm("Discard unsaved result changes?")
    ) {
      return;
    }

    const report = reports.find((item) => item._id === id);

    setSelectedId(id);
    setValues(
      report
        ? report.tests.map((test) =>
            test.results.map((parameter) => parameter.result ?? "")
          )
        : []
    );
    setDirty(false);
    setError("");
    setSuccess("");
  }

  function changeResult(testIndex, parameterIndex, value) {
    setValues((previous) =>
      previous.map((testValues, index) =>
        index === testIndex
          ? testValues.map((result, parameter) =>
              parameter === parameterIndex ? value : result
            )
          : testValues
      )
    );

    setDirty(true);
    setError("");
    setSuccess("");
  }

  async function saveResults(event) {
    event.preventDefault();

    if (!selectedReport || submitting.current) return;

    const updates = values.flatMap((testValues, testIndex) =>
      testValues.map((result, parameterIndex) => ({
        testIndex,
        parameterIndex,
        result,
      }))
    );

    if (updates.length === 0) {
      setError("This report has no parameters to save.");
      return;
    }

    submitting.current = true;
    setSaving(true);
    setError("");
    setSuccess("");

    let savedReport;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${selectedId}/results`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save results.");
      }

      savedReport = {
        ...data,
        patient: selectedReport.patient,
      };
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }

    if (savedReport) {
      setValues(
        savedReport.tests.map((test) =>
          test.results.map((parameter) => parameter.result ?? "")
        )
      );
      setDirty(false);
      setSuccess("Results saved successfully. Report remains a draft.");
      onReportSaved(savedReport);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Enter Results</h3>
        <span>Manual entry</span>
      </div>

      <div className="patient-form">
        <label className="form-field">
          <span>Select Draft Report</span>
          <select
            value={selectedId}
            onChange={selectReport}
            disabled={saving}
          >
            <option value="">Select a report</option>

            {draftReports.map((report) => (
              <option key={report._id} value={report._id}>
                {report.patient?.name || "Patient unavailable"}
                {" — "}
                {report.tests.map((test) => test.testName).join(" + ")}
                {" — "}
                {new Date(report.reportDate).toLocaleDateString("en-IN")}
                {" — ID: "}
                {report._id.slice(-6)}
              </option>
            ))}
          </select>
        </label>

        {draftReports.length === 0 && (
          <p>No draft reports available. Create one first.</p>
        )}

        {selectedReport && (
          <form onSubmit={saveResults}>
            <p className="result-patient">
              <strong>{selectedReport.patient?.name}</strong>
              {" · "}
              {selectedReport.patient?.age}
              {" "}
              {selectedReport.patient?.ageUnit}
              {" · "}
              {selectedReport.patient?.gender}
            </p>

            {selectedReport.tests.map((test, testIndex) => (
              <div className="result-section" key={testIndex}>
                <h4>{test.testName}</h4>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Investigation</th>
                        <th>Result</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                      </tr>
                    </thead>

                    <tbody>
                      {test.results.map((parameter, parameterIndex) => (
                        <tr key={parameterIndex}>
                          <td>{parameter.parameterName}</td>

                          <td>
                            <input
                              className="result-input"
                              type="text"
                              aria-label={`${test.testName}: ${parameter.parameterName} result`}
                              value={
                                values[testIndex]?.[parameterIndex] ?? ""
                              }
                              onChange={(event) =>
                                changeResult(
                                  testIndex,
                                  parameterIndex,
                                  event.target.value
                                )
                              }
                              disabled={saving}
                              placeholder="Enter result"
                              autoComplete="off"
                            />
                          </td>

                          <td>{parameter.unit || "—"}</td>
                          <td>{parameter.referenceRange || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving || !dirty}
              >
                {saving ? "Saving..." : "Save Results"}
              </button>

              {dirty && (
                <span className="unsaved-note">Unsaved changes</span>
              )}
            </div>
          </form>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="form-success" role="status">
            {success}
          </p>
        )}
      </div>
    </section>
  );
}

export default ResultEntry;