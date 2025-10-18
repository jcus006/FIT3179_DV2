    // Embed all three
    Promise.all([
      vegaEmbed("#vis1", "specs/bar_chart.json", { actions:false }),
      vegaEmbed("#vis2", "specs/isotype.json", { actions:false }),
      vegaEmbed("#vis3", "specs/strip_chart.json", { actions:false }),
      vegaEmbed("#vis4", "specs/state_selected.json", { actions:false })
    ]).then(([e1, e2, e3, e4]) => {
      const v1 = e1.view, v2 = e2.view, v3 = e3.view, v4 = e4.view;

      // Helper to push external control values into all views
      const push = (yr, st) => {
        v1.signal("year_filter", yr).signal("state_filter", st).run();
        v2.signal("year_filter", yr).signal("state_filter", st).run();
        v3.signal("year_filter", yr).signal("state_filter", st).run();
        v4.signal("state_filter", st).run();
      };

      // Wire external controls
      const yearEl  = document.getElementById("year");
      const yearLbl = document.getElementById("yearVal");
      const stateEl = document.getElementById("state");

      const update = () => {
        const yr = Number(yearEl.value);
        const st = stateEl.value;
        yearLbl.textContent = yr;
        push(yr, st);
      };

      // Init from defaults in inputs
      update();

      yearEl.addEventListener("input", update);
      stateEl.addEventListener("change", update);

      // (Optional) read ?year=2012&state=Queensland from URL
      const params = new URLSearchParams(location.search);
      if (params.has("year")) { yearEl.value = params.get("year"); }
      if (params.has("state")) { stateEl.value = params.get("state"); }
      if (params.has("year") || params.has("state")) update();
    }).catch(err => {
      console.error(err);
      const pre = document.createElement('pre');
      pre.textContent = String(err && err.stack || err);
      pre.style.color = 'crimson'; pre.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(pre);
    });