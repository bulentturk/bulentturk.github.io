"use client";

import { useEffect } from "react";

const dailyBrief = {
  date: "August 4, 2026",
  title: "Engineering Daily",
  subtitle: "AI, Off-Highway Machinery & Engineering Brief",
  intro:
    "A concise daily review of developments shaping intelligent machines, electrification, connected systems, hydraulics, engineering science and health technology.",
  sections: [
    {
      code: "AI / 01",
      title: "AI Is Moving Closer to the Machine",
      paragraphs: [
        "Artificial intelligence is increasingly being deployed at the edge rather than used only in remote cloud services. Industrial systems can now process camera, radar, sensor and machine-state data locally, reducing communication delay and dependence on continuous connectivity.",
        "For off-highway machinery, this shift supports faster diagnostics, operator assistance and more responsive automation in mines, construction sites and agricultural environments where network availability may be limited.",
      ],
      perspective:
        "The important design challenge is no longer simply adding more sensors. The real value comes from combining sensor data into dependable machine decisions while keeping the control architecture understandable, testable and safe.",
    },
    {
      code: "MACHINERY / 02",
      title: "Electrification Is Becoming a System-Level Engineering Problem",
      paragraphs: [
        "Battery-electric and hybrid machines continue to expand across construction, mining and material-handling applications. The engineering discussion is shifting from whether electrification is possible to how duty cycle, charging, thermal limits and machine availability should be balanced.",
        "Hybrid architectures remain especially relevant for machines with high peak power, long shifts or limited charging access. They can reduce fuel use and idle time without requiring every operating condition to be supported by the battery alone.",
      ],
      perspective:
        "Battery capacity is only one design input. Thermal management, low-voltage power continuity, contactor control, charging logic and software interlocks often determine whether an electrified machine is practical in the field.",
    },
    {
      code: "HYDRAULICS / 03",
      title: "Hydraulic Data Is Becoming a Maintenance Signal",
      paragraphs: [
        "Pressure, temperature, flow and valve-command data are increasingly being used as indicators of hydraulic system health. When these signals are stored together with machine state and duty cycle, they can reveal leakage, restriction, overheating and abnormal load behavior before a visible failure occurs.",
        "This creates an opportunity to move from calendar-based maintenance toward condition-based service, especially on machines where hydraulic downtime has a direct production cost.",
      ],
      perspective:
        "A useful predictive system does not begin with an AI model. It begins with correctly scaled signals, reliable timestamps, known operating modes and enough context to distinguish a real fault from normal heavy-duty operation.",
    },
    {
      code: "ELECTRICAL / 04",
      title: "Connected Electrical Architectures Need Better Observability",
      paragraphs: [
        "Modern mobile machines rely on distributed controllers, CAN networks, smart sensors and increasingly complex power-management logic. As the number of connected devices grows, commissioning and troubleshooting require better visibility into message timing, power states and software versions.",
        "Engineers are therefore placing more emphasis on structured diagnostics, trace recording and version-aware configuration rather than treating communication faults as isolated wiring problems.",
      ],
      perspective:
        "Good observability should show not only what value was received, but also when it arrived, which controller produced it, how it was scaled and whether the machine state allowed that value to be trusted.",
    },
    {
      code: "CAN / J1939 / 05",
      title: "CAN Analysis Is Shifting from Frames to Behavior",
      paragraphs: [
        "Raw CAN frames remain essential, but useful analysis increasingly focuses on behavior over time: cycle period, jitter, counter progression, missing messages, mode transitions and correlations between commands and physical response.",
        "This is particularly important in J1939 systems, where a valid PGN does not automatically mean that the source address, scaling, update rate or operating context is correct.",
      ],
      perspective:
        "The best diagnostic workflow connects four layers: physical bus health, frame timing, signal interpretation and independent field measurement. Skipping any one of these layers can produce a convincing but incorrect conclusion.",
    },
    {
      code: "TELEMETRY / 06",
      title: "Telemetry Design Is Moving Toward Event Context",
      paragraphs: [
        "Machine telemetry projects are becoming more selective. Instead of uploading every signal at a high rate, many systems now combine a low-rate operational baseline with event-triggered high-resolution capture.",
        "Pre-event buffers, post-event windows and offline storage policies are becoming central requirements because they preserve the context needed to understand why a fault or abnormal condition occurred.",
      ],
      perspective:
        "A strong event definition includes the trigger, debounce time, priority, captured signals, pre-event history, closing condition and retention policy. Without these elements, telemetry can generate large data volumes with little diagnostic value.",
    },
    {
      code: "MECHANICAL / 07",
      title: "Mechanical Reliability Still Depends on Interface Details",
      paragraphs: [
        "Digital systems may dominate current discussions, but mechanical reliability continues to depend on fundamentals such as fits, alignment, lubrication, surface pressure and assembly method. Small errors at pin, bushing, shaft and bearing interfaces can create rapid wear even when the overall design appears strong.",
        "Design teams are increasingly linking these classical checks with measured field loads and maintenance feedback to improve component life.",
      ],
      perspective:
        "The most effective mechanical improvement loop combines calculation, manufacturing tolerance, assembly verification and actual machine loading. Treating these as separate departments usually hides the real cause of recurring failures.",
    },
    {
      code: "SCIENCE / 08",
      title: "Simulation and Sensing Are Converging",
      paragraphs: [
        "Engineering research continues to combine digital twins, low-cost sensing and machine learning. The goal is not only to simulate a system before production, but also to keep the model updated using real operating data.",
        "This approach is spreading across energy systems, structures, electronics and industrial equipment because it can support design validation, anomaly detection and lifecycle optimization.",
      ],
      perspective:
        "A digital twin is only as credible as its calibration. Models that are not continuously compared with field measurements can become visually impressive but operationally misleading.",
    },
    {
      code: "HEALTH / 09",
      title: "Health Technology Is Raising the Standard for Trustworthy AI",
      paragraphs: [
        "Medical AI is expanding into wearable sensing, remote monitoring and clinical decision support. At the same time, researchers are paying greater attention to bias, explainability and validation across different patient populations.",
        "These requirements are relevant beyond healthcare because they show how AI can be evaluated in safety-critical environments where a high average accuracy is not enough.",
      ],
      perspective:
        "Industrial engineering can learn from medical validation methods: define the intended use clearly, test edge cases, document limitations and avoid presenting uncertain model output as a guaranteed decision.",
    },
  ],
  sources: [
    "IEEE Spectrum",
    "SAE International",
    "OEM Off-Highway",
    "Nature",
    "Science",
    "MIT News",
    "Bosch Rexroth",
    "Danfoss Power Solutions",
    "HYDAC",
    "ifm electronic",
  ],
};

export default function EngineeringBlog() {
  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = `${dailyBrief.title} | ALGO TEAM`;
  }, []);

  return (
    <main className="blog-page">
      <header className="site-header blog-header">
        <a className="brand" href="/" aria-label="ALGO TEAM home">ALGO<span>TEAM</span></a>
        <a className="blog-back" href="/">← Back to tools</a>
      </header>

      <section className="blog-hero">
        <p className="overline">ALGO TEAM / ENGINEERING DAILY</p>
        <h1>{dailyBrief.title}</h1>
        <p>{dailyBrief.date}</p>
        <p>{dailyBrief.subtitle}</p>
        <p>{dailyBrief.intro}</p>
      </section>

      <section className="blog-articles">
        {dailyBrief.sections.map((section) => (
          <article id={section.code.toLowerCase().replaceAll(" / ", "-").replaceAll(" ", "-")} className="blog-article" key={section.code}>
            <div className="blog-article-code">{section.code}</div>
            <div className="blog-article-content">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className="blog-lead" key={paragraph}>{paragraph}</p>
              ))}
              <aside>
                <strong>Engineering Perspective</strong>
                <p>{section.perspective}</p>
              </aside>
            </div>
          </article>
        ))}

        <article className="blog-article" id="sources">
          <div className="blog-article-code">SOURCES</div>
          <div className="blog-article-content">
            <h2>Sources Referenced</h2>
            <p className="blog-lead">
              This brief is an original editorial summary prepared from reporting and technical updates published by the following organizations. Publication names are shown instead of direct article links during the pilot period.
            </p>
            <ul>
              {dailyBrief.sources.map((source) => <li key={source}>{source}</li>)}
            </ul>
            <aside>
              <strong>Editorial Note</strong>
              <p>Health-related content is provided for general information and should not be interpreted as medical advice.</p>
            </aside>
          </div>
        </article>
      </section>

      <footer>
        <p>ALGO TEAM · ENGINEERING TOOLS</p>
        <p>AI · OFF-HIGHWAY MACHINERY · CAN · TELEMETRY · ENGINEERING</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
