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

  function sortable(table) {
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

  function thlInteract(root = document) {
    root.querySelectorAll('table.is-sortable').forEach(sortable);
    root.querySelectorAll('table.has-detail-rows, table.is-sortable').forEach(expandable);
    root.querySelectorAll('[data-filter-target]').forEach(filterable);
    root.querySelectorAll('svg.has-tooltip').forEach(tooltips);
  }

  window.thlInteract = thlInteract;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => thlInteract());
  } else {
    thlInteract();
  }
})();
