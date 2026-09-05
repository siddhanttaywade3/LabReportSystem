import { useRef, useState } from "react";

function newParameter() {
  return {
    name: "",
    unit: "",
    referenceRange: "",
    resultType: "Number",
  };
}

function TestManagement({ onTestAdded }) {
  const [name, setName] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [parameters, setParameters] = useState([newParameter()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  function updateParameter(index, field, value) {
    setParameters((previous) =>
      previous.map((parameter, position) =>
        position === index
          ? { ...parameter, [field]: value }
          : parameter
      )
    );
  }

  function removeParameter(index) {
    setParameters((previous) =>
      previous.filter((_, position) => position !== index)
    );
  }

  function moveParameter(index, direction) {
    setParameters((previous) => {
      const target = index + direction;

      if (target < 0 || target >= previous.length) return previous;

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

    if (!name.trim()) {
      setError("Enter the test or report name.");
      return;
    }

    if (
      parameters.length === 0 ||
      parameters.some((parameter) => !parameter.name.trim())
    ) {
      setError("Add at least one parameter and enter every parameter name.");
      return;
    }

    submitting.current = true;
    setSaving(true);

    let savedTest;

    try {
      const response = await fetch(
        "http://localhost:5000/api/tests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            sampleType: sampleType.trim(),
            isActive: true,
            parameters: parameters.map((parameter) => ({
              name: parameter.name.trim(),
              unit: parameter.unit.trim(),
              referenceRange: parameter.referenceRange.trim(),
              resultType: parameter.resultType,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save test.");
      }

      savedTest = data;
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }

    if (savedTest) {
      setName("");
      setSampleType("");
      setParameters([newParameter()]);
      setSuccess(`${savedTest.name} added successfully.`);
      onTestAdded(savedTest);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Test Management</h3>
        <span>Add a new test and its parameters</span>
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
            <label className="form-field">
              <span>Test / Report Name *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter report heading"
                required
              />
            </label>

            <label className="form-field">
              <span>Sample Type</span>
              <input
                value={sampleType}
                onChange={(event) => setSampleType(event.target.value)}
                placeholder="For example: Blood or Urine"
              />
            </label>
          </div>

          <h4 className="form-section-title">Parameters</h4>

          <p className="order-help">
            Parameters appear in the order below. Patient results will
            be entered separately when preparing a report.
          </p>

          {parameters.map((parameter, index) => (
            <div className="parameter-editor" key={index}>
              <h4>Parameter {index + 1}</h4>

              <div className="form-grid">
                <label className="form-field">
                  <span>Parameter Name *</span>
                  <input
                    value={parameter.name}
                    onChange={(event) =>
                      updateParameter(index, "name", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Result Type</span>
                  <select
                    value={parameter.resultType}
                    onChange={(event) =>
                      updateParameter(
                        index,
                        "resultType",
                        event.target.value
                      )
                    }
                  >
                    <option value="Number">Number</option>
                    <option value="Text">Text</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Unit</span>
                  <input
                    value={parameter.unit}
                    onChange={(event) =>
                      updateParameter(index, "unit", event.target.value)
                    }
                    placeholder="Leave blank if not applicable"
                  />
                </label>

                <label className="form-field">
                  <span>Reference Range</span>
                  <input
                    value={parameter.referenceRange}
                    onChange={(event) =>
                      updateParameter(
                        index,
                        "referenceRange",
                        event.target.value
                      )
                    }
                    placeholder="Enter your lab's reference range"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="order-button"
                  onClick={() => moveParameter(index, -1)}
                  disabled={saving || index === 0}
                >
                  Move Up
                </button>

                <button
                  type="button"
                  className="order-button"
                  onClick={() => moveParameter(index, 1)}
                  disabled={saving || index === parameters.length - 1}
                >
                  Move Down
                </button>

                <button
                  type="button"
                  className="order-button"
                  onClick={() => removeParameter(index)}
                  disabled={saving || parameters.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button
              type="button"
              className="order-button"
              onClick={() =>
                setParameters((previous) => [
                  ...previous,
                  newParameter(),
                ])
              }
            >
              + Add Parameter
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save New Test"}
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

export default TestManagement;