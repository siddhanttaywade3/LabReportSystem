import { useRef, useState } from "react";

function CompleteReport({ reports, onReportCompleted }) {
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  const drafts = reports.filter(
    (report) => report.status === "Draft"
  );

  const selectedReport = drafts.find(
    (report) => report._id === selectedId
  );

  async function handleComplete(event) {
    event.preventDefault();

    if (!selectedReport || submitting.current) return;

    submitting.current = true;
    setSaving(true);
    setError("");
    setSuccess("");

    let completedReport;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${selectedId}/complete`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete report.");
      }

      completedReport = data;
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }

    if (completedReport) {
      setSelectedId("");
      setSuccess("Report completed successfully.");
      onReportCompleted(completedReport);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Complete Report</h3>
        <span>Review saved results</span>
      </div>

      <form className="patient-form" onSubmit={handleComplete}>
        <label className="form-field">
          <span>Select Draft Report</span>
          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setError("");
              setSuccess("");
            }}
            disabled={saving}
            required
          >
            <option value="">Select a report</option>

            {drafts.map((report) => (
              <option key={report._id} value={report._id}>
                {report.patient?.name || "Patient unavailable"}
                {" — "}
                {report.tests.map((test) => test.testName).join(" + ")}
                {" — ID: "}
                {report._id.slice(-6)}
              </option>
            ))}
          </select>
        </label>

        {selectedReport && (
          <>
            <p className="order-help">
              These are the saved results. Save any pending changes in
              Enter Results before completing this report.
            </p>

            {selectedReport.tests.map((test, testIndex) => (
              <div className="result-section" key={testIndex}>
                <h4>{test.testName}</h4>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Investigation</th>
                        <th>Saved Result</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                      </tr>
                    </thead>

                    <tbody>
                      {test.results.map((parameter, index) => (
                        <tr key={index}>
                          <td>{parameter.parameterName}</td>
                          <td>
                            {parameter.result?.trim() || "Not entered"}
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

            <p className="order-help">
              Completing the report locks its results against editing.
            </p>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Completing..." : "Complete Report"}
            </button>
          </>
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
      </form>
    </section>
  );
}

export default CompleteReport;