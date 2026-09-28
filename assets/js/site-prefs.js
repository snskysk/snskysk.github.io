/*!
 * site-prefs.js - language + design-variant switching
 * ---------------------------------------------------
 * Two independent preferences, both remembered in localStorage:
 *
 *   siteLang    "en" | "ja"                                -> body[data-lang]
 *   siteDesign  "classic" | "editorial" | "modern" | ...   -> body[data-design]
 *
 * Dark mode is NOT handled here; it stays with the stock
 * assets/plugins/dark-mode-switch plugin (localStorage key "darkSwitch").
 *
 * The inline boot snippet in index.html applies the stored values before
 * first paint. This file only wires up the buttons and keeps them in sync.
 */
(function () {
  "use strict";

  var LANGS = ["en", "ja"];
  var DESIGNS = ["classic", "editorial", "modern", "minimal"];

  var TITLES = {
    en: "Shunsuke Yasuki (安木 駿介) - CV, Research Page",
    ja: "安木 駿介 (Shunsuke Yasuki) - CV・研究ページ"
  };

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* private mode / blocked storage: the choice just will not persist */
    }
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) {
      lang = "en";
    }
    document.body.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    if (TITLES[lang]) {
      document.title = TITLES[lang];
    }
    syncGroup("data-set-lang", lang);
    return lang;
  }

  function applyDesign(design) {
    if (DESIGNS.indexOf(design) === -1) {
      design = "classic";
    }
    document.body.setAttribute("data-design", design);
    syncGroup("data-set-design", design);
    return design;
  }

  function syncGroup(attr, value) {
    var buttons = document.querySelectorAll("[" + attr + "]");
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i].getAttribute(attr) === value;
      buttons[i].classList.toggle("is-active", active);
      buttons[i].setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function bind(attr, apply, storageKey) {
    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("[" + attr + "]") : null;
      if (!button) {
        return;
      }
      event.preventDefault();
      store(storageKey, apply(button.getAttribute(attr)));
    });
  }

  function init() {
    // Re-apply from the DOM so the buttons match whatever the boot snippet set.
    applyLang(document.body.getAttribute("data-lang") || "en");
    applyDesign(document.body.getAttribute("data-design") || "classic");

    bind("data-set-lang", applyLang, "siteLang");
    bind("data-set-design", applyDesign, "siteDesign");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
