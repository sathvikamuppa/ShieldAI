import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanText = async () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend not running");
    }

    setLoading(false);
  };

  const copyOutput = () => {
    if (!result?.sanitized_text) return;

    navigator.clipboard.writeText(result.sanitized_text);
    alert("Copied Successfully");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background:
          "radial-gradient(circle at top, #0ea5e9 0%, #0f172a 35%, #020617 100%)",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: "90px",
              fontWeight: "900",
              marginBottom: "10px",
              background:
                "linear-gradient(90deg,#38bdf8,#8b5cf6,#06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🛡 ShieldAI
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "20px",
            }}
          >
            AI Powered Sensitive Data Leakage Detection Platform
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div>📧 Email Detection</div>
          <div>📱 Phone Detection</div>
          <div>🪪 Aadhaar Detection</div>
          <div>🆔 PAN Detection</div>
          <div>🔑 Password Detection</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            ⚡ Real-Time Detection
          </div>

          <div
            style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            🔒 Data Protection
          </div>

          <div
            style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            🛡 Risk Assessment
          </div>

          <div
            style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            📊 Smart Analytics
          </div>
        </div>

        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,.95), rgba(30,41,59,.95))",
            borderRadius: "25px",
            padding: "40px",
            boxShadow:
              "0 0 40px rgba(14,165,233,.25), 0 0 80px rgba(139,92,246,.15)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "25px",
            }}
          >
            🔍 Paste Content To Scan
          </h2>

          <textarea
            rows="14"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste Emails, Phones, Aadhaar, PAN, Passwords..."
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "15px",
              border: "none",
              fontSize: "14px",
            }}
          />

          <p
            style={{
              textAlign: "right",
              color: "#94a3b8",
              marginTop: "10px",
            }}
          >
            Characters: {text.length}
          </p>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <button
              onClick={scanText}
              style={{
                background:
                  "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                color: "white",
                border: "none",
                padding: "18px 50px",
                borderRadius: "14px",
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Scanning..." : "🚀 Scan Now"}
            </button>
          </div>

          {result && (
            <div
              style={{
                marginTop: "40px",
                background: "#1e293b",
                padding: "25px",
                borderRadius: "15px",
              }}
            >
              <h2 style={{ textAlign: "center" }}>
                <div
  style={{
    background:
      result.risk_level === "HIGH"
        ? "#ef4444"
        : result.risk_level === "MEDIUM"
        ? "#f59e0b"
        : "#22c55e",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "22px",
    marginBottom: "20px",
  }}
>
  {result.risk_level === "HIGH"
    ? "🚨 DATA LEAK DETECTED"
    : result.risk_level === "MEDIUM"
    ? "⚠️ MEDIUM RISK"
    : "✅ SAFE CONTENT"}
</div>
                📊 Analysis Report
              </h2>

              <h3>
                Risk Score:
                <span
                  style={{
                    color: "#ef4444",
                    marginLeft: "10px",
                  }}
                >
                  {result.risk_score}
                </span>
              </h3>

              <h3>
                Risk Level:
                <span
                  style={{
                    color:
                      result.risk_level === "HIGH"
                        ? "#ef4444"
                        : "#f59e0b",
                    marginLeft: "10px",
                  }}
                >
                  {result.risk_level}
                </span>
              </h3>

              <hr />

              <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "10px",
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <div>📧<br />Emails<br />{result.emails_found?.length || 0}</div>

  <div>📱<br />Phones<br />{result.phones_found?.length || 0}</div>

  <div>🪪<br />Aadhaar<br />{result.aadhaars_found?.length || 0}</div>

  <div>🆔<br />PAN<br />{result.pans_found?.length || 0}</div>

  <div>🔑<br />Passwords<br />{result.passwords_found?.length || 0}</div>
</div>
              <hr />

              <h3>🛡 Sanitized Output</h3>

              <textarea
                rows="8"
                readOnly
                value={result.sanitized_text || ""}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "none",
                }}
              />

              <button
                onClick={copyOutput}
                style={{
                  marginTop: "15px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                📋 Copy Sanitized Output
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#94a3b8",
          }}
        >
          ShieldAI v1.0 • React + FastAPI • Hackathon Project
        </div>
      </div>
    </div>
  );
}

export default App;