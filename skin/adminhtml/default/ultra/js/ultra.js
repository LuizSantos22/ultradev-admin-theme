(function () {
    var root = document.documentElement;

    // Aplica o tema salvo antes do body renderizar (evita flash)
    try {
        var saved = localStorage.getItem('ux-theme');
        if (saved) root.setAttribute('data-theme', saved);
    } catch (e) {}

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var body = document.body;
        var qs   = function (s, c) { return (c || document).querySelector(s); };
        var qsa  = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
        var mq   = window.matchMedia('(max-width:860px)');

        /* ---------- Tema claro/escuro ---------- */
        var themeBtn = qs('#ux-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                var cur  = root.getAttribute('data-theme');
                var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme:dark)').matches;
                var next = dark ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                try { localStorage.setItem('ux-theme', next); } catch (e) {}
            });
        }

        /* ---------- Sidebar ---------- */
        var side = qs('#ux-side');
        if (side) {
            var menuBtn = qs('#ux-menu');
            var isOpen  = function () { return body.classList.contains('nav-open'); };
            var setNav  = function (open) {
                body.classList.toggle('nav-open', open);
                if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
                if (!mq.matches) { try { localStorage.setItem('ux-nav', open ? '1' : '0'); } catch (e) {} }
            };
            if (isOpen() && menuBtn) menuBtn.setAttribute('aria-expanded', 'true');

            if (menuBtn) menuBtn.addEventListener('click', function () { setNav(!isOpen()); });

            qsa('.ux-group').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var wasClosed = !isOpen();
                    if (wasClosed) setNav(true);
                    var willOpen = wasClosed || btn.getAttribute('aria-expanded') !== 'true';
                    qsa('.ux-group').forEach(function (x) {
                        x.setAttribute('aria-expanded', 'false');
                        x.nextElementSibling.classList.remove('open');
                    });
                    if (willOpen) {
                        btn.setAttribute('aria-expanded', 'true');
                        btn.nextElementSibling.classList.add('open');
                    }
                });
            });

            var scrim = qs('#ux-scrim');
            if (scrim) scrim.addEventListener('click', function () { setNav(false); });
            document.addEventListener('click', function (e) {
                if (mq.matches && isOpen() && !e.target.closest('#ux-side,#ux-menu')) setNav(false);
            });
        }

        /* ---------- Drawer de pedidos (Painel Ultra) ---------- */
        var dr = qs('#ux-drawer'), ds = qs('#ux-dscrim'), lastEl = null;
        function openD(li) {
            lastEl = li;
            qs('#ux-dname').textContent  = li.getAttribute('data-name');
            qs('#ux-dname2').textContent = li.getAttribute('data-name');
            qs('#ux-ditems').textContent = li.getAttribute('data-items');
            qs('#ux-dtot').textContent   = li.getAttribute('data-total');
            qs('#ux-dopen').setAttribute('href', li.getAttribute('data-url'));
            dr.classList.add('open'); ds.classList.add('show');
            dr.setAttribute('aria-hidden', 'false');
            qs('.ux-dclose', dr).focus();
        }
        function closeD() {
            if (!dr || !dr.classList.contains('open')) return;
            dr.classList.remove('open'); ds.classList.remove('show');
            dr.setAttribute('aria-hidden', 'true');
            if (lastEl) lastEl.focus();
        }
        if (dr) {
            qsa('#ux-orders li[data-url]').forEach(function (li) {
                li.addEventListener('click', function () { openD(li); });
                li.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openD(li); }
                });
            });
            qsa('.ux-dclose', dr).forEach(function (b) { b.addEventListener('click', closeD); });
            ds.addEventListener('click', closeD);
        }

        /* ---------- Atalhos ---------- */
        document.addEventListener('keydown', function (e) {
            var search = qs('#global_search');
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && search) {
                e.preventDefault(); search.focus();
            }
            if (e.key === 'Escape') {
                if (mq.matches && side) body.classList.remove('nav-open');
                closeD();
            }
        });
    });
})();
