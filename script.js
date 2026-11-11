// Shared by every page: list / prose switch (home only) and the theme picker.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".view-toggle");
  if (!btn) return; // only the home page has the list / prose switch
  function sync() {
    var prose = root.dataset.view === "prose";
    var label = prose ? "Less Detail" : "More Detail";
    btn.setAttribute("aria-checked", prose);
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }
  sync();
  btn.addEventListener("click", function () {
    var prose = root.dataset.view !== "prose";
    if (prose) root.dataset.view = "prose"; else delete root.dataset.view;
    try { localStorage.setItem("view", prose ? "prose" : "list"); } catch (e) {}
    sync();
  });
})();
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  var menu = document.getElementById("theme-menu");
  var options = menu.querySelectorAll("[data-theme-value]");
  var mq = matchMedia("(prefers-color-scheme: dark)");

  function getPref() {
    var p = null;
    try { p = localStorage.getItem("theme"); } catch (e) {}
    return p === "light" || p === "dark" ? p : "auto";
  }
  function apply(pref) {
    root.dataset.theme = pref === "auto" ? (mq.matches ? "dark" : "light") : pref;
    toggle.querySelector("use").setAttribute("href", "#icon-" + pref);
    options.forEach(function (o) { o.setAttribute("aria-pressed", o.dataset.themeValue === pref); });
  }
  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", open);
  }

  apply(getPref());
  toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(menu.hidden); });
  options.forEach(function (o) {
    o.addEventListener("click", function () {
      var pref = o.dataset.themeValue;
      try { pref === "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", pref); } catch (e) {}
      apply(pref);
      setOpen(false);
      toggle.focus();
    });
  });
  document.addEventListener("click", function (e) { if (!menu.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
  });
  mq.addEventListener("change", function () { if (getPref() === "auto") apply("auto"); });
})();
