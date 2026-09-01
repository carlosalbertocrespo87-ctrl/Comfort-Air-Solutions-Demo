(() => {
  const replacements = new Map([
    ["Client Portal & ROI", "Lead Delivery & Visibility"],
    ["See leads, appointments, jobs and revenue in one simple dashboard.", "Receive qualified lead details through a clear delivery and reporting workflow."],
    ["Live lead and revenue activity", "Illustrative interface preview — not actual client results"],
    ["Performance Overview", "Lead Capture Workflow Preview"],
    ["ROI Tracking", "Delivery Status"],
    ["Funnels", "Qualification Flow"],
    ["Local Lead Forge combines bilingual AI, smart automation and high-converting demo pages to help local service businesses capture more opportunities and turn website traffic into measurable revenue.", "Local Lead Forge combines bilingual AI, smart automation and high-converting demo pages to help local service businesses capture and qualify more website opportunities."],
    ["Client reporting & ROI", "Lead delivery & reporting"],
    ["Performance Snapshot", "Illustrative Workflow"],
    ["Results you can actually see.", "See how the lead flow is designed to work."],
    ["100% Focused on ROI", "Focused on Lead Capture"],
    ["average weekly lead growth in this dashboard example", "illustrative dashboard figure — not a performance claim"]
  ]);

  const replaceTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const current = node.nodeValue?.trim();
      if (!current) continue;
      const replacement = replacements.get(current);
      if (replacement) node.nodeValue = node.nodeValue.replace(current, replacement);
    }
  };

  const addIllustrativeNotice = () => {
    const results = document.getElementById("results");
    if (!results) return;
    let notice = results.querySelector("[data-llf-illustrative-notice]");
    if (!notice) {
      notice = document.createElement("p");
      notice.dataset.llfIllustrativeNotice = "true";
      notice.className = "mt-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.04] px-4 py-3 text-[9px] leading-5 text-slate-500";
      const heading = results.querySelector("h2");
      heading?.insertAdjacentElement("afterend", notice);
    }
    notice.textContent = document.documentElement.lang === "es"
      ? "Las cifras de interfaz mostradas aquí son ejemplos ilustrativos. No representan resultados reales de clientes, garantías ni afirmaciones de rendimiento de Local Lead Forge."
      : "Interface figures shown here are illustrative placeholders only. They are not Local Lead Forge performance claims, guarantees, or actual client results.";
  };

  const reconcile = () => {
    const root = document.getElementById("root");
    if (!root) return;
    replaceTextNodes(root);
    addIllustrativeNotice();
  };

  reconcile();
  const observer = new MutationObserver(reconcile);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", reconcile, { once: true });
  window.addEventListener("llf-language-change", reconcile);
})();
