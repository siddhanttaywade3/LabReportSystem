import { useRef, useState } from "react";

function ReportForm({ patients, tests, reports, onReportCreated }) {
  const [patientId, setPatientId] = useState("");
  const [referredBy, setReferredBy] = useState("Self");
  const [sampleCollectedAt, setSampleCollectedAt] =
    useState("Collected in Lab");
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  const activeTests = tests.filter((test) => test.isActive);

  const doctorNames = [
    ...new Set([
      "Self",
      ...reports
        .map((report) => report.referredBy)
        .filter(Boolean),
    ]),
  ];

  function toggleTest(id) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((testId) => testId !== id)
        : [...previous, id]
    );
  }

  function moveTest(index, direction) {
    setSelectedIds((previous) => {
      const target = index + direction;

      if (target < 0 || target >= previous.length) {
        return previous;
      }

      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    setError("");
    setSuccess("");

    if (!patientId || selectedIds.length === 0) {
      setError("Select a patient and at least one test.");
      return;
    }

    submitting.current = true;
    setSaving(true);

    let createdReport;

    try {
      const response = await fetch(
        "http://localhost:5000/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            testIds: selectedIds,
            referredBy: referredBy.trim(),
            sampleCollectedAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create report.");
      }

      createdReport = {
        ...data,
        patient: patients.find((patient) => patient._id === patientId),
      };
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }

    if (createdReport) {
      setPatientId("");
      setSelectedIds([]);
      setReferredBy("Self");
      setSampleCollectedAt("Collected in Lab");
      setSuccess("Draft report created. Results are blank for manual entry.");
      onReportCreated(createdReport);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Create Report</h3>
        <span>Select tests in your preferred order</span>
      </div>

      <form
        className="patient-form"
        onSubmit={handleSubmit}
        onChange={() => {
          setError("");
          setSuccess("");
        }}
      >
        <fieldset className="patient-fields" disabled={saving}>
          <div className="form-grid">
            <label className="form-field field-wide">
              <span>Patient *</span>
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} — {patient.age} {patient.ageUnit}
                    {" / "}
                    {patient.gender}
                    {" / ID: "}
                    {patient._id.slice(-6)}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Referred By *</span>
              <input
                list="referring-doctors"
                value={referredBy}
                onChange={(event) => setReferredBy(event.target.value)}
                placeholder="Select or type a doctor name"
                required
              />
              <datalist id="referring-doctors">
                {doctorNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

            <label className="form-field">
              <span>Sample Collection *</span>
              <select
                value={sampleCollectedAt}
                onChange={(event) =>
                  setSampleCollectedAt(event.target.value)
                }
                required
              >
                <option>Collected in Lab</option>
                <option>Collected in Hospital</option>
                <option>Collected at Home</option>
                <option>Received from Outside</option>
              </select>
            </label>
          </div>

          <h4 className="form-section-title">Select Tests *</h4>

          {activeTests.length === 0 ? (
            <p>No active tests available.</p>
          ) : (
            <div className="test-options">
              {activeTests.map((test) => (
                <label className="test-option" key={test._id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(test._id)}
                    onChange={() => toggleTest(test._id)}
                  />
                  <span>{test.name}</span>
                </label>
              ))}
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="report-order">
              <h4 className="form-section-title">Report Order</h4>
              <p className="order-help">
                The first selected section appears at the top.
              </p>

              <ol className="order-list">
                {selectedIds.map((id, index) => (
                  <li key={id}>
                    <span>
                      {tests.find((test) => test._id === id)?.name}
                    </span>

                    <div className="order-buttons">
                      <button
                        type="button"
                        className="order-button"
                        onClick={() => moveTest(index, -1)}
                        disabled={saving || index === 0}
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        className="order-button"
                        onClick={() => moveTest(index, 1)}
                        disabled={
                          saving || index === selectedIds.length - 1
                        }
                      >
                        Move Down
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Draft Report"}
            </button>
          </div>
        </fieldset>

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

export default ReportForm;