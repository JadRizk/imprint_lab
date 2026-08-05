/* ── Interactivity ─────────────────────────────────────────────────────────
 *
 * Optional. Everything below is progressive enhancement: without this file the
 * tables still read, the charts still render, the disclosures are still open.
 * That is deliberate — the base kit's value is that it survives email, PDF
 * export and a strict CSP, and none of those run script.
 *
 * No dependencies, no build step, no globals beyond one initialiser.
 *
 *   <table class="is-sortable">        click a header to sort
 *   <div class="filter" data-filter-target="#id">   type to filter rows
 *   <tr class="has-detail"> + <tr class="detail">   click to expand
 *   <svg class="has-tooltip"> + [data-tip] on marks
 *   <div class="tabs">                  radio tabs -> ARIA tablist + arrow keys
 *
 * Call thlInteract() after the DOM is ready, or let the auto-init at the bottom
 * do it.
 */

(() => {
  const num = (s) => {
    // Sort numerically when a cell is a number, a percentage, or a byte size —
    // otherwise "10" sorts before "9" and the table quietly lies.
    const m = String(s)
      .replace(/[, ]/g, '')
      .match(/^-?\d+(\.\d+)?/);
    return m ? Number.parseFloat(m[0]) : null;
  };

  const done = (el, key) => {
    // Enhancing twice would double-bind every listener — one click would sort
    // twice and land back where it started. The docs invite both an explicit
    // thlInteract() call and the auto-init, so this has to be safe.
    if (el.dataset[key]) return true;
    el.dataset[key] = '1';
    return false;
  };

  function sortable(table) {
    if (done(table, 'thlSortable')) return;
    const heads = table.querySelectorAll('thead th');
    heads.forEach((th, col) => {
      if (th.dataset.nosort !== undefined) return;
      th.tabIndex = 0;
      th.setAttribute('role', 'button');
      th.setAttribute('aria-sort', 'none');

      const run = () => {
        const body = table.tBodies[0];
        const rows = [...body.rows].filter((r) => !r.classList.contains('detail'));
        const asc = th.getAttribute('aria-sort') !== 'ascending';

        rows.sort((a, b) => {
          const x = a.cells[col]?.textContent.trim() ?? '';
          const y = b.cells[col]?.textContent.trim() ?? '';
          const nx = num(x);
          const ny = num(y);
          const d =
            nx !== null && ny !== null ? nx - ny : x.localeCompare(y, undefined, { numeric: true });
          return asc ? d : -d;
        });

        for (const h of heads) {
          h.setAttribute('aria-sort', 'none');
        }
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');

        // Keep any detail row immediately after the row it belongs to.
        for (const r of rows) {
          const detail = r.nextElementSibling?.classList.contains('detail')
            ? r.nextElementSibling
            : null;
          body.appendChild(r);
          if (detail) body.appendChild(detail);
        }
      };

      th.addEventListener('click', run);
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          run();
        }
      });
    });
  }

  function filterable(input) {
    if (done(input, 'thlFilter')) return;
    const target = document.querySelector(input.dataset.filterTarget);
    if (!target) return;
    const count = document.querySelector(input.dataset.filterCount || '');

    const run = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      for (const row of target.tBodies[0].rows) {
        if (row.classList.contains('detail')) continue;
        const hit = !q || row.textContent.toLowerCase().includes(q);
        row.hidden = !hit;
        if (row.nextElementSibling?.classList.contains('detail')) {
          row.nextElementSibling.hidden = !hit || !row.classList.contains('is-open');
        }
        if (hit) shown++;
      }
      if (count) count.textContent = String(shown);
    };

    input.addEventListener('input', run);
    run();
  }

  function expandable(table) {
    if (done(table, 'thlExpand')) return;
    for (const row of table.querySelectorAll('tr.has-detail')) {
      const detail = row.nextElementSibling;
      if (!detail?.classList.contains('detail')) continue;
      detail.hidden = true;
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', 'false');

      const toggle = () => {
        const open = row.classList.toggle('is-open');
        detail.hidden = !open;
        row.setAttribute('aria-expanded', String(open));
      };

      row.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        toggle();
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    }
  }

  function tooltips(svg) {
    if (done(svg, 'thlTooltip')) return;
    const host = svg.closest('.chart') || svg.parentElement;
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    let tip = host.querySelector('.chart-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tooltip';
      tip.hidden = true;
      host.appendChild(tip);
    }

    const show = (el, e) => {
      tip.innerHTML = el.dataset.tip;
      tip.hidden = false;
      const box = host.getBoundingClientRect();
      tip.style.left = `${e.clientX - box.left + 12}px`;
      tip.style.top = `${e.clientY - box.top + 12}px`;
    };
    const hide = () => {
      tip.hidden = true;
    };

    for (const mark of svg.querySelectorAll('[data-tip]')) {
      mark.addEventListener('mousemove', (e) => show(mark, e));
      mark.addEventListener('mouseleave', hide);
      // Keyboard users get the same information without a pointer.
      mark.tabIndex = 0;
      mark.addEventListener('focus', (e) =>
        show(
          mark,
          e.target.getBoundingClientRect()
            ? {
                clientX: e.target.getBoundingClientRect().left,
                clientY: e.target.getBoundingClientRect().top
              }
            : e
        )
      );
      mark.addEventListener('blur', hide);
    }
    svg.addEventListener('mouseleave', hide);
  }

  function tabs(root) {
    if (done(root, 'thlTabs')) return;
    const radios = [...root.querySelectorAll(':scope > .tab-radio')];
    const list = root.querySelector(':scope > .tab-list');
    const labels = list ? [...list.querySelectorAll(':scope > .tab')] : [];
    const panels = [...root.querySelectorAll(':scope > .tab-panels > .tab-panel')];
    // A mismatch means the positional pairing the CSS relies on is already
    // broken. Enhancing it would add ARIA that lies about which panel a tab
    // controls, so leave it as the plain radio group it is.
    if (radios.length < 2 || labels.length !== radios.length) return;

    list.setAttribute('role', 'tablist');

    const sync = () => {
      radios.forEach((radio, i) => {
        labels[i].setAttribute('aria-selected', String(radio.checked));
        // Roving tabindex: one stop for the whole strip, arrows move within it.
        labels[i].tabIndex = radio.checked ? 0 : -1;
      });
    };

    const select = (i) => {
      radios[i].checked = true;
      sync();
      labels[i].focus();
    };

    radios.forEach((radio, i) => {
      const label = labels[i];
      const panel = panels[i];

      if (!label.id) label.id = `${radio.id || `thl-tab-${i}`}-tab`;
      label.setAttribute('role', 'tab');

      if (panel) {
        if (!panel.id) panel.id = `${radio.id || `thl-tab-${i}`}-panel`;
        label.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', label.id);
        // The panel can hold content taller than the viewport, so it has to be
        // reachable and scrollable by keyboard in its own right.
        panel.tabIndex = 0;
      }

      // The radio was the keyboard control before enhancement; the labels are
      // now, so it leaves the tab order rather than becoming a second stop.
      // Hiding it from the accessibility tree too, or a screen reader meets the
      // same control twice — once as this radio group and once as the tablist
      // built on top of it. Safe only because it is no longer focusable.
      radio.tabIndex = -1;
      radio.setAttribute('aria-hidden', 'true');
      // Clicking a label checks its radio natively — nothing to intercept, only
      // the ARIA to bring back in line.
      radio.addEventListener('change', sync);

      label.addEventListener('keydown', (e) => {
        const last = radios.length - 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') select(i === last ? 0 : i + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') select(i === 0 ? last : i - 1);
        else if (e.key === 'Home') select(0);
        else if (e.key === 'End') select(last);
        // A <label> is not a button: the browser activates it on click only, so
        // the keyboard equivalent has to be written.
        else if (e.key === 'Enter' || e.key === ' ') select(i);
        else return;
        e.preventDefault();
      });
    });

    sync();
  }

  function thlInteract(root = document) {
    root.querySelectorAll('table.is-sortable').forEach(sortable);
    root.querySelectorAll('table.has-detail-rows, table.is-sortable').forEach(expandable);
    root.querySelectorAll('[data-filter-target]').forEach(filterable);
    root.querySelectorAll('svg.has-tooltip').forEach(tooltips);
    root.querySelectorAll('.tabs').forEach(tabs);
  }

  window.thlInteract = thlInteract;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => thlInteract());
  } else {
    thlInteract();
  }
})();
