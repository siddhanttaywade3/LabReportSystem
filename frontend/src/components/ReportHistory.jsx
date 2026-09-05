import { useMemo, useState } from "react";

function ReportHistory({ reports }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const patient = report.patient || {};

      const searchableText = [
        patient.name,
        patient.phone,
        patient.address,
        report.referredBy,
        report._id,
        ...report.tests.map((test) => test.testName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        status === "All" || report.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, status]);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Patient & Report History</h3>
        <span>{filteredReports.length} reports found</span>
      </div>

      <div className="history-controls">
        <label className="form-field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Patient, phone, doctor, test or report ID"
          />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="All">All Reports</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
      </div>

      {filteredReports.length === 0 ? (
        <p className="empty">No matching reports found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Tests</th>
                <th>Referred By</th>
                <th>Date</th>
                <th>Report ID</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <strong>
                      {report.patient?.name || "Patient unavailable"}
                    </strong>

                    {report.patient?.phone && (
                      <small className="patient-phone">
                        {report.patient.phone}
                      </small>
                    )}
                  </td>

                  <td>
                    {report.patient
                      ? `${report.patient.age} ${
                          report.patient.ageUnit
                        } / ${report.patient.gender}`
                      : "—"}
                  </td>

                  <td>
                    {report.tests
                      .map((test) => test.testName)
                      .join(", ")}
                  </td>

                  <td>{report.referredBy || "—"}</td>

                  <td>
                    {new Date(
                      report.reportDate
                    ).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <code>{report._id.slice(-8).toUpperCase()}</code>
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
  );
}

export default ReportHistory;