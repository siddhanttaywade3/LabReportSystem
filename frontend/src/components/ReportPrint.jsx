import { useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function Microscope() {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Microscope"
    >
      <rect width="80" height="80" rx="18" fill="#e6f5f2" />
      <g
        stroke="#0f766e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M31 17L44 24L33 43L20 36Z" />
        <path d="M34 12L46 19" />
        <path d="M26 40L23 46" />
        <path d="M43 30C61 33 63 58 45 64" />
        <path d="M21 51H44" />
        <path d="M34 52V64" />
        <path d="M19 66H60" />
      </g>
      <circle cx="48" cy="37" r="5" fill="#12334a" />
    </svg>
  );
}

function ReportDocument({ report, mode }) {
  const patient = report.patient || {};

  return (
    <table className="page-layout">
      <thead>
        <tr>
          <td className="page-cell">
            {mode === "full" && (
              <header className="letterhead">
                <div className="brand-row">
                  <Microscope />
                  <div>
                    <div className="lab-name">SAMRUDDHI</div>
                    <div className="lab-subtitle">
                      CLINICAL LABORATORY
                    </div>
                  </div>
                </div>

                <div className="lab-details">
                  <strong>Mrs. Surekha K. Taywade</strong>
                  <div>B.Sc., D.M.L.T.</div>
                  <div>Reg. No. D/MLT/0009/2020</div>
                </div>

                <div className="contact-strip">
                  <div>
                    Krushnarpan Complex, Main Road, Chandur Bazar,
                    Dist. Amravati
                  </div>
                  <div>
                    Phone: 9096271591 / 7588085031
                    {" · "}Working time: 9 am to 8 pm
                  </div>
                </div>
              </header>
            )}

            <section className="patient-details">
              <div>
                <p><strong>Patient:</strong> {patient.name}</p>
                <p>
                  <strong>Referred By:</strong>{" "}
                  {report.referredBy || "—"}
                </p>
                <p>
                  <strong>Sample:</strong> {report.sampleCollectedAt}
                </p>
              </div>

              <div>
                <p>
                  <strong>Age / Sex:</strong>{" "}
                  {patient.age} {patient.ageUnit} / {patient.gender}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(report.reportDate).toLocaleDateString("en-IN")}
                </p>
                <p>
                  <strong>Report Ref:</strong>{" "}
                  {report._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </section>
          </td>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="page-cell">
            {report.tests.map((test, testIndex) => {
              const hasUnits = test.results.some((item) => item.unit);
              const hasRanges = test.results.some(
                (item) => item.referenceRange
              );
              const isHaemogram =
                test.testName.toLowerCase().includes("haemogram");
              const columnCount = 2 + Number(hasUnits) + Number(hasRanges);

              return (
                <section className="test-section" key={testIndex}>
                  <h2>
                    {test.testName.toUpperCase()}
                    {!/report$/i.test(test.testName.trim()) && " REPORT"}
                  </h2>

                  <table className="results">
                    <thead>
                      <tr>
                        <th>Investigation</th>
                        <th>Result</th>
                        {hasUnits && <th>Unit</th>}
                        {hasRanges && <th>Reference Range</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {test.results.map((item, index) => (
                        <ResultRows
                          key={index}
                          item={item}
                          hasUnits={hasUnits}
                          hasRanges={hasRanges}
                          columnCount={columnCount}
                          showHeading={
                            isHaemogram &&
                            item.parameterName.toLowerCase() === "neutrophils"
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </section>
              );
            })}

            <footer className="report-footer">
              <p className="end-marker">— End of Report —</p>
              <div className="signature">Authorized Signatory</div>
            </footer>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function ResultRows({
  item,
  hasUnits,
  hasRanges,
  columnCount,
  showHeading,
}) {
  return (
    <>
      {showHeading && (
        <tr className="group-heading">
          <td colSpan={columnCount}>DIFF. LEUCOCYTE COUNT</td>
        </tr>
      )}
      <tr>
        <td>{item.parameterName}</td>
        <td className="result-value">{item.result}</td>
        {hasUnits && <td>{item.unit}</td>}
        {hasRanges && (
          <td className="reference-range">
            {item.referenceRange.split(";").map((range, index) => (
              <div key={index}>{range.trim()}</div>
            ))}
          </td>
        )}
      </tr>
    </>
  );
}

function ReportPrint({ reports }) {
  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState("full");
  const [topSpace, setTopSpace] = useState(55);
  const [bottomSpace, setBottomSpace] = useState(30);
  const [ready, setReady] = useState(false);
  const frameRef = useRef(null);

  const completedReports = reports.filter(
    (report) => report.status === "Completed"
  );

  const report = completedReports.find(
    (item) => item._id === selectedId
  );

  const reportTitle = report
    ? `${(report.patient?.name || "Patient")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
        .replace(/\s+/g, " ")
        .trim() || "Patient"} Report`
    : "Laboratory Report";

  function printReport() {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow || !report || !ready) return;

    // Chromium can use the parent page title for iframe PDF filenames.
    const previousTitle = document.title;
    document.title = reportTitle;
    frameWindow.document.title = reportTitle;

    const restoreTitle = () => {
      document.title = previousTitle;
      frameWindow.removeEventListener("afterprint", restoreTitle);
      window.removeEventListener("afterprint", restoreTitle);
    };

    frameWindow.addEventListener("afterprint", restoreTitle);
    window.addEventListener("afterprint", restoreTitle);

    try {
      frameWindow.focus();
      frameWindow.print();
    } catch (error) {
      restoreTitle();
      throw error;
    }
  }

  const documentHtml = useMemo(() => {
    if (!report) return "";

    const top = mode === "preprinted" ? topSpace : 12;
    const bottom = mode === "preprinted" ? bottomSpace : 15;

    const css = `
      @page {
        size: A4 portrait;
        margin: ${top}mm 12mm ${bottom}mm;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: white;
        color: #172b3a;
        font-family: Arial, sans-serif;
        font-size: 10pt;
      }

      .page-layout {
        width: 100%;
        border-collapse: collapse;
      }

      .page-layout > thead { display: table-header-group; }
      .page-cell { padding: 0; vertical-align: top; }

      .letterhead {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        border-bottom: 3px solid #0f766e;
        padding-bottom: 10px;
      }

      .brand-row { display: flex; align-items: center; gap: 12px; }
      .lab-name {
        font-size: 28pt;
        letter-spacing: 1px;
        font-weight: 800;
        color: #12334a;
      }
      .lab-subtitle {
        color: #0f766e;
        font-size: 11pt;
        letter-spacing: 2px;
        font-weight: bold;
      }
      .lab-details {
        font-size: 9pt;
        text-align: right;
        line-height: 1.6;
      }
      .contact-strip {
        grid-column: 1 / -1;
        background: #eaf5f3;
        padding: 8px 10px;
        text-align: center;
        line-height: 1.6;
        font-size: 9pt;
      }

      .patient-details {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 16px;
        padding: 12px 0;
        margin-bottom: 10px;
        border-bottom: 1px solid #8fa8ad;
      }
      .patient-details p { margin: 0 0 6px; }
      .patient-details p:last-child { margin-bottom: 0; }

      .test-section { margin-bottom: 18px; }
      h2 {
        margin: 0;
        padding: 7px;
        text-align: center;
        color: #12334a;
        font-size: 12pt;
        border-bottom: 2px solid #0f766e;
        break-after: avoid;
      }

      .results {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .results thead { display: table-header-group; }
      .results th {
        padding: 7px 6px;
        background: #edf5f4;
        text-align: left;
        font-size: 9pt;
      }
      .results th:first-child { width: 38%; }
      .results td {
        padding: 5px 6px;
        border-bottom: 1px solid #e0e7e9;
        vertical-align: top;
        overflow-wrap: anywhere;
      }
      .results tr { break-inside: avoid; }
      .result-value { font-weight: bold; }
      .reference-range { font-size: 9pt; line-height: 1.35; }
      .group-heading td {
        font-size: 9pt;
        font-weight: bold;
        padding-top: 9px;
      }

      .report-footer { break-inside: avoid; }
      .end-marker { text-align: center; font-size: 9pt; }
      .signature {
        padding-top: 30px;
        text-align: right;
        font-size: 9pt;
      }

      @media screen {
        body {
          padding: ${top}mm 12mm ${bottom}mm;
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
        }
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
          min-height: 0;
          font-size: 9pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .letterhead { gap: 8px; padding-bottom: 6px; }
        .brand-row svg { width: 52px; height: 52px; }
        .lab-name { font-size: 25pt; }
        .lab-subtitle { font-size: 10pt; }
        .contact-strip { padding: 5px 8px; line-height: 1.4; }
        .patient-details { padding: 8px 0; margin-bottom: 6px; }
        .patient-details p { margin-bottom: 4px; }
        .test-section { margin-bottom: 12px; }
        h2 { padding: 5px; font-size: 11pt; }
        .results th { padding: 5px 6px; font-size: 9pt; }
        .results td {
          padding: 3.5px 6px;
          font-size: 9pt;
          line-height: 1.25;
        }
        .results .reference-range { font-size: 8.5pt; line-height: 1.25; }
        .group-heading td { padding-top: 5px; }
        .end-marker { margin: 6px 0; font-size: 8pt; }
        .signature { padding-top: 18px; font-size: 9pt; }
      }
    `;

    return "<!DOCTYPE html>" + renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <title>{reportTitle}</title>
          <style>{css}</style>
        </head>
        <body>
          <ReportDocument report={report} mode={mode} />
        </body>
      </html>
    );
  }, [report, reportTitle, mode, topSpace, bottomSpace]);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Report Preview & Print</h3>
        <span>Completed reports</span>
      </div>

      <div className="patient-form">
        <div className="form-grid">
          <label className="form-field field-wide">
            <span>Select Completed Report</span>
            <select
              value={selectedId}
              onChange={(event) => {
                setReady(false);
                setSelectedId(event.target.value);
              }}
            >
              <option value="">Select a report</option>
              {completedReports.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.patient?.name || "Patient unavailable"}
                  {" — "}
                  {item.tests.map((test) => test.testName).join(" + ")}
                  {" — ID: "}
                  {item._id.slice(-6)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field field-wide">
            <span>Print Mode</span>
            <select
              value={mode}
              onChange={(event) => {
                setReady(false);
                setMode(event.target.value);
              }}
            >
              <option value="full">Plain A4 — Full Letterhead</option>
              <option value="preprinted">Preprinted Letterhead</option>
            </select>
          </label>

          {mode === "preprinted" && (
            <>
              <label className="form-field">
                <span>Top Blank Space: {topSpace} mm</span>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={topSpace}
                  onChange={(event) => {
                    setReady(false);
                    setTopSpace(Number(event.target.value));
                  }}
                />
              </label>

              <label className="form-field">
                <span>Bottom Blank Space: {bottomSpace} mm</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={bottomSpace}
                  onChange={(event) => {
                    setReady(false);
                    setBottomSpace(Number(event.target.value));
                  }}
                />
              </label>
            </>
          )}
        </div>

        {report && (
          <>
            <div className="form-actions">
              <button
                type="button"
                className="primary-button"
                disabled={!ready}
                onClick={printReport}
              >
                Print / Save as PDF
              </button>
            </div>

            <p className="order-help">
              Use A4 portrait, 100% scale, and turn browser headers
              and footers off. Check pagination in the print dialog.
            </p>

            <iframe
              ref={frameRef}
              title="Laboratory report preview"
              srcDoc={documentHtml}
              onLoad={() => setReady(true)}
              style={{
                width: "100%",
                height: "750px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#ffffff",
                marginTop: "12px",
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default ReportPrint;