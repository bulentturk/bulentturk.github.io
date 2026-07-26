(() => {
  const addDtcPreview = () => {
    const stack = document.querySelector(".tools-preview-stack");
    if (!stack || stack.querySelector(".dtc-tool-preview")) return Boolean(stack);

    const panel = document.createElement("div");
    panel.className = "dtc-tool-preview";
    panel.innerHTML = `
      <div class="preview-top">
        <span>J1939 DM1 / DTC ANALYSIS</span>
        <i></i>
      </div>
      <div class="dtc-preview-summary">
        <span><i></i> MOTOR ECU #1</span>
        <strong>2 ACTIVE DTC</strong>
      </div>
      <div class="dtc-preview-row">
        <div>
          <span>SPN 100</span>
          <strong>FMI 01</strong>
        </div>
        <p>Engine Oil Pressure</p>
        <small>ACTIVE</small>
      </div>
      <div class="dtc-preview-row">
        <div>
          <span>SPN 110</span>
          <strong>FMI 15</strong>
        </div>
        <p>Engine Coolant Temperature</p>
        <small>WARNING</small>
      </div>
      <div class="dtc-preview-context">
        <div><span>ENGINE</span><strong>1842 rpm</strong></div>
        <div><span>TORQUE</span><strong>68 %</strong></div>
        <div><span>HOURS</span><strong>4286 h</strong></div>
      </div>
      <div class="preview-status"><i></i> DM1 DECODED · TRACE ANALYZED</div>
    `;
    stack.append(panel);
    return true;
  };

  if (addDtcPreview()) return;

  const observer = new MutationObserver(() => {
    if (addDtcPreview()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
