// Shared by every page: theme picker and expandable work / research rows.
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
    // tab icon follows the chosen theme, not just the system setting
    document.querySelectorAll('link[rel="icon"]').forEach(function (l) {
      l.href = "/favicon-" + root.dataset.theme + ".svg";
    });
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

// Expandable work experiences.
// Opening an entry sends an Umami event named "expand-<entry>", e.g. "expand-amazon-web-services".
function slug(text) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40); }
document.querySelectorAll(".exp-head").forEach(function (head) {
  head.addEventListener("click", function () {
    var open = head.getAttribute("aria-expanded") !== "true";
    head.setAttribute("aria-expanded", open);
    var name = head.querySelector("b");
    if (open && name && window.umami) umami.track("expand-" + slug(name.textContent));
  });
});

// Show the hill green, not the page color, when overscrolling past the bottom of the page.
(function () {
  var root = document.documentElement;
  function setBottom(on) { root.classList.toggle("overscroll-bottom", on); }
  function update() {
    var max = root.scrollHeight - innerHeight;
    if (max > 0) setBottom(scrollY > max / 2);
  }
  // Pages too short to scroll: decide by which way the user is pulling.
  addEventListener("wheel", function (e) {
    if (root.scrollHeight - innerHeight <= 0 && e.deltaY) setBottom(e.deltaY > 0);
  }, { passive: true });
  var touchY = null;
  addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", function (e) {
    if (touchY !== null && root.scrollHeight - innerHeight <= 0) setBottom(e.touches[0].clientY < touchY);
  }, { passive: true });
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
})();
