import { useRef, useState } from "react";

const emptyForm = {
  name: "",
  age: "",
  ageUnit: "Years",
  gender: "",
  phone: "",
  address: "",
};

function PatientForm({ onPatientAdded }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    setError("");
    setSuccess("");

    const age = Number(form.age);

    if (
      !form.name.trim() ||
      form.age.trim() === "" ||
      !Number.isFinite(age) ||
      age < 0 ||
      !form.gender
    ) {
      setError("Enter a patient name, valid age, and gender.");
      return;
    }

    submitting.current = true;
    setSaving(true);

    let patient;

    try {
      const response = await fetch(
        "http://localhost:5000/api/patients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            age,
            phone: form.phone.trim(),
            address: form.address.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save patient.");
      }

      patient = data;
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }

    if (patient) {
      setForm({ ...emptyForm });
      setSuccess(`${patient.name} registered successfully.`);
      onPatientAdded(patient);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Register Patient</h3>
        <span>* Required fields</span>
      </div>

      <form className="patient-form" onSubmit={handleSubmit}>
        <fieldset className="patient-fields" disabled={saving}>
          <div className="form-grid">
            <label className="form-field field-wide">
              <span>Patient Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label className="form-field">
              <span>Age *</span>
              <input
                type="number"
                name="age"
                min="0"
                step="1"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />
            </label>

            <label className="form-field">
              <span>Age Unit *</span>
              <select
                name="ageUnit"
                value={form.ageUnit}
                onChange={handleChange}
              >
                <option value="Years">Years</option>
                <option value="Months">Months</option>
                <option value="Days">Days</option>
              </select>
            </label>

            <label className="form-field">
              <span>Gender *</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="form-field">
              <span>Phone</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Optional"
              />
            </label>

            <label className="form-field field-wide">
              <span>Address</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Optional"
                rows="2"
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Patient"}
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

export default PatientForm;