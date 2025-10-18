// scripts/embed.js

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

function findBindings(root) {
  // Try several likely spots
  return (
    root.querySelector?.('.vega-bindings') ||
    root.querySelector?.('.vega-embed .vega-bindings') ||
    root.querySelector?.('.vega-bindings-wrapper .vega-bindings') ||
    null
  );
}

function moveBindingsOnce(r3, targetId = 'vis3-controls') {
  const target = document.getElementById(targetId);
  if (!target) return;

  const tryMove = () => {
    const bindings = findBindings(r3.element) ||
                     (r3.view && r3.view.container ? findBindings(r3.view.container()) : null);
    if (bindings && bindings.parentNode !== target) {
      // Put ABOVE the chart
      target.prepend(bindings);
      return true;
    }
    return false;
  };

  // Try immediately
  if (tryMove()) return;

  // If not present yet, observe until it appears
  const obs = new MutationObserver(() => {
    if (tryMove()) obs.disconnect();
  });
  obs.observe(r3.element, { childList: true, subtree: true });
}

(async () => {
  const [spec1, spec2, spec3] = await Promise.all([
    loadJSON("specs/vis1.json"),
    loadJSON("specs/vis2.json"),
    loadJSON("specs/vis3.json"),
  ]);

  const [r1, r2, r3] = await Promise.all([
    vegaEmbed("#vis1", spec1, { actions: false }),
    vegaEmbed("#vis2", spec2, { actions: false }),
    vegaEmbed("#vis3", spec3, { actions: false }),
  ]);

  const v1 = r1.view, v2 = r2.view, v3 = r3.view;

  // Move the controls ABOVE vis3 (into the same column)
  moveBindingsOnce(r3, "vis3-controls");

  // Sync shared params from vis3 -> vis1 & vis2
  const SIGNALS = ["year_filter", "state_filter"];

  SIGNALS.forEach((sig) => {
    v3.addSignalListener(sig, (_name, value) => {
      v1.signal(sig, value).run();
      v2.signal(sig, value).run();
    });
  });

  // Initialize vis1/vis2 to vis3's starting values
  SIGNALS.forEach((sig) => {
    const initVal = v3.signal(sig);
    if (typeof initVal !== "undefined") {
      v1.signal(sig, initVal).run();
      v2.signal(sig, initVal).run();
    }
  });
})();
