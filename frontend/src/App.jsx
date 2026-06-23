import { useState } from "react";
import "./App.css";

function App() {
  const [fileName, setFileName] =
  useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [llmResponse, setLlmResponse] = useState("");
  const [rehydratedResponse, setRehydratedResponse] =
    useState("");

  const scanText = async () => {
    if (!text.trim()) {
      alert("Please enter some content");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend not running");
    }

    setLoading(false);
  };

  const copyOutput = () => {
    if (!result?.sanitized_text) return;

    navigator.clipboard.writeText(
      result.sanitized_text
    );

    alert("Copied Successfully");
  };
  const restoreContext = async () => {

  if (!llmResponse.trim()) {
    alert("Paste LLM Response");
    return;
  }

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/rehydrate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response_text: llmResponse,
          placeholder_map:
            result.placeholder_map,
        }),
      }
    );

    const data = await response.json();

    setRehydratedResponse(
      data.rehydrated_response
    );

  } catch {
    alert("Rehydration Failed");
  }
};
const copyRehydrated = () => {

  if (!rehydratedResponse) return;

  navigator.clipboard.writeText(
    rehydratedResponse
  );

  alert(
    "Rehydrated Response Copied"
  );
};
const handleFileUpload = async (
  event
) => {

  const file =
    event.target.files[0];

  if (!file) return;

  setFileName(file.name);

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  try {

    const response =
      await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    setText(data.text);

  } catch {

    alert(
      "File Upload Failed"
    );

  }
};
  return (
    <div className="app">

      {/* HERO SECTION */}

      <div className="hero">

        <h1>🛡️ ShieldAI</h1>

        <p className="hero-subtitle">
          Enterprise AI Governance Firewall
        </p>

        <p className="hero-description">
          Prevent sensitive data leakage before it reaches
          ChatGPT, Gemini, Claude, Copilot, or any
          external LLM.
        </p>

      </div>

      {/* DETECTION BADGES */}

      <div className="capability-line">
  PII Detection • Credential Detection • Source Code Analysis • AI Entity Recognition
</div>

      {/* FEATURE CARDS */}

      <div className="feature-grid">

        <div className="feature-card">
          ⚡ Real-Time Detection
        </div>

        <div className="feature-card">
          🔒 Data Protection
        </div>

        <div className="feature-card">
          🛡 Risk Assessment
        </div>

        <div className="feature-card">
          📊 Smart Analytics
        </div>

      </div>

      {/* WORKSPACE */}

      <div className="workspace">

        <h2>
          Prompt Inspection Workspace
        </h2>

        <textarea
  rows="14"
  value={text}
  onChange={(e) =>
    setText(e.target.value)
  }
  placeholder="Paste Prompt, Source Code, Customer Data..."
/>

<div className="upload-section">

  <input
    type="file"
    accept=".txt,.pdf,.docx"
    onChange={handleFileUpload}
  />

  {fileName && (

    <p className="file-name">

      📄 {fileName}

    </p>

  )}

</div>

<p className="char-count">
  Characters: {text.length}
</p>

        <p className="char-count">
          Characters: {text.length}
        </p>

        <div className="button-container">

          <button
            className="scan-button"
            onClick={scanText}
          >
            {loading
              ? "Analyzing..."
              : "🚀 Analyze Prompt"}
          </button>

        </div>

      </div>

      {/* RESULTS */}

      {result && (

        <div className="results-container">

          {/* ALERT BANNER */}

          <div
            className={`alert-banner ${
              result.risk_level === "HIGH"
                ? "high"
                : result.risk_level === "MEDIUM"
                ? "medium"
                : "low"
            }`}
          >
            {result.risk_level === "HIGH"
              ? "🚨 DATA LEAK DETECTED"
              : result.risk_level === "MEDIUM"
              ? "⚠️ MEDIUM RISK DETECTED"
              : "✅ SAFE CONTENT"}
          </div>
                    {/* EXECUTIVE DASHBOARD */}

          <div className="kpi-grid">

            <div className="kpi-card">
              <h4>Risk Score</h4>
              <h1>{result.risk_score}</h1>
            </div>

            <div className="kpi-card">
              <h4>Risk Level</h4>
              <h1>{result.risk_level}</h1>
            </div>

            <div className="kpi-card">
              <h4>Intent</h4>
              <h1>{result.intent}</h1>
            </div>

            <div className="kpi-card">
              <h4>Decision</h4>
              <h1>{result.action}</h1>
            </div>

          </div>

          {/* RISK ASSESSMENT */}

          <div className="report-card">

            <h2>Risk Assessment</h2>

            <div className="risk-bar">

              <div
                className="risk-fill"
                style={{
                  width: `${result.risk_score}%`,
                }}
              />

            </div>

            <h3>
              {result.risk_score}% Risk Score
            </h3>

            <p>
              {result.risk_level} RISK
            </p>

          </div>

          {/* FIREWALL DECISION */}

          <div className="report-card">

            <h2>
              Firewall Decision Center
            </h2>

            <div
              className={`decision-badge ${result.action}`}
            >
              {result.action}
            </div>

            <p>
              Multiple sensitive identifiers
              detected. Prompt evaluated against
              ShieldAI governance policies.
            </p>

          </div>

          {/* THREAT INTELLIGENCE */}

          <div className="report-card">

            <h2>
              Threat Intelligence
            </h2>

            <ul className="threat-list">

              {result.reasons?.map(
                (reason, index) => (
                  <li key={index}>
                    {reason}
                  </li>
                )
              )}

            </ul>

          </div>

          {/* AI ENTITY INTELLIGENCE */}

          <div className="report-card">

            <h2>
              AI Entity Intelligence
            </h2>

           

  
<div className="entity-card">
  <h4>PERSONS</h4>
  <h2>{result.persons_found?.length || 0}</h2>
</div>

<div className="entity-card">
  <h4>ORGANIZATIONS</h4>
  <h2>{result.organizations_found?.length || 0}</h2>
</div>

<div className="entity-card">
  <h4>LOCATIONS</h4>
  <h2>{result.locations_found?.length || 0}</h2>
</div>

          </div>

          {/* DETECTION STATISTICS */}

          <div className="report-card">

            <h2>
              Detection Statistics
            </h2>

            <div className="stats-grid">

              <div className="stat-box">
                <h4>Emails</h4>
                <h1>
                  {result.emails_found?.length || 0}
                </h1>
              </div>

              <div className="stat-box">
                <h4>Phones</h4>
                <h1>
                  {result.phones_found?.length || 0}
                </h1>
              </div>

              <div className="stat-box">
                <h4>Aadhaar</h4>
                <h1>
                  {result.aadhaars_found?.length || 0}
                </h1>
              </div>

              <div className="stat-box">
                <h4>PAN</h4>
                <h1>
                  {result.pans_found?.length || 0}
                </h1>
              </div>

              <div className="stat-box">
                <h4>Passwords</h4>
                <h1>
                  {result.passwords_found?.length || 0}
                </h1>
              </div>

            </div>

          </div>

          {/* PROMPT PROTECTION */}

          <div className="report-card">

            <h2>
              Prompt Protection
            </h2>

            <div className="comparison-grid">

              <div>

                <h3>
                  Original Prompt
                </h3>

                <textarea
                  readOnly
                  value={text}
                />

              </div>

              <div>

                <h3>
                  Protected Prompt
                </h3>

                <textarea
                  readOnly
                  value={
                    result.sanitized_text || ""
                  }
                />

              </div>

            </div>

            <button
              className="copy-button"
              onClick={copyOutput}
            >
              📋 Copy Protected Prompt
            </button>

          </div>
          <div className="report-card">

  <h2>
    Restore Original Context
  </h2>

  <p>
    Paste the response generated by
    ChatGPT, Gemini, Claude, or any
    external AI system.
  </p>

  <div className="comparison-grid">

  <div>

    <h3>
      External AI Response
    </h3>

    <textarea
      rows="12"
      value={llmResponse}
      onChange={(e) =>
        setLlmResponse(e.target.value)
      }
      placeholder="Paste ChatGPT / Gemini / Claude response here..."
    />

  </div>

  <div>

    <h3>
      Original Context Restored
    </h3>

    <textarea
      rows="12"
      readOnly
      value={rehydratedResponse}
    />

  </div>

</div>

<div className="button-container">

  <button
    className="copy-button"
    onClick={restoreContext}
  >
    🔄 Rehydrate Response
  </button>

  {rehydratedResponse && (

    <button
      className="copy-button"
      onClick={copyRehydrated}
    >
      📋 Copy Restored Response
    </button>

  )}

</div>



</div>
        </div>

      )}

      {/* FOOTER */}

      <footer className="footer">

        <h3>ShieldAI</h3>

        <p>
          Enterprise AI Governance Firewall
        </p>

        <p>
          Powered by FastAPI • HuggingFace • React
        </p>

      </footer>

    </div>
  );
}

export default App;