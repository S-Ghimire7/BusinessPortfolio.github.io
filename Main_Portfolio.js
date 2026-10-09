(function () {
  "use strict";

  var CONFIG = {
    email: "foot123trick@gmail.com",
    phone: "9761805799",
    usdRate: 140, // Rs. per 1 USD. Change this number if the exchange rate moves.
  };

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* Theme */
  var root = document.documentElement;
  var themeBtn = $("#themeToggle");

  function syncThemeLabel() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
  }
  syncThemeLabel();

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sg-theme", next);
    } catch (e) {}
    syncThemeLabel();
  });

  /* Mobile menu */
  var menuBtn = $("#menuToggle");
  var nav = $("#nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () {
      setMenu(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* Active link while scrolling */
  var links = $$("[data-link]");
  var sections = ["home", "skills", "services", "contact"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle(
              "active",
              l.getAttribute("data-link") === entry.target.id,
            );
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  /* Typed code in the hero */
  var typedEl = $("#typed");
  var snippet = [
    "def plan(assignment, days_left):",
    "    steps = break_down(assignment)",
    "    pace = len(steps) / days_left",
    "    for step in steps:",
    "        step.due = schedule(step, pace)",
    "    return steps  # small steps, clear deadlines",
  ].join("\n");

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(text) {
    return escapeHtml(text).replace(
      /(#.*$)|('[^'\n]*'|"[^"\n]*")|\b(def|for|in|return|if|else)\b/gm,
      function (m, comment, str, kw) {
        if (comment) return '<span class="cm">' + comment + "</span>";
        if (str) return '<span class="str">' + str + "</span>";
        return '<span class="kw">' + kw + "</span>";
      },
    );
  }

  if (typedEl) {
    if (reduceMotion) {
      typedEl.innerHTML = highlight(snippet);
    } else {
      var i = 0;
      var tick = function () {
        i += 1;
        typedEl.innerHTML = highlight(snippet.slice(0, i));
        if (i < snippet.length) {
          var ch = snippet.charAt(i - 1);
          setTimeout(tick, ch === "\n" ? 260 : 28 + Math.random() * 40);
        }
      };
      setTimeout(tick, 700);
    }
  }

  /* Skill filter */
  var chips = $$(".chip");
  var skills = $$(".skill");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      skills.forEach(function (s) {
        s.hidden = !(filter === "all" || s.getAttribute("data-cat") === filter);
      });
    });
  });

  /* Currency toggle */
  var prices = $$(".price");
  var curBtns = $$(".cur-btn");
  var note = $("#currencyNote");

  function formatPrice(el, currency) {
    var npr = Number(el.getAttribute("data-npr"));
    var plus = el.getAttribute("data-plus") === "true" ? "+" : "";
    if (currency === "USD") {
      return (
        "about $" +
        Math.round(npr / CONFIG.usdRate).toLocaleString("en-US") +
        plus
      );
    }
    return "Rs. " + npr.toLocaleString("en-IN") + plus;
  }

  function setCurrency(currency) {
    prices.forEach(function (p) {
      p.textContent = formatPrice(p, currency);
    });
    curBtns.forEach(function (b) {
      b.setAttribute(
        "aria-pressed",
        String(b.getAttribute("data-cur") === currency),
      );
    });
    note.textContent =
      currency === "USD"
        ? "Dollar amounts are rounded, using Rs. " +
          CONFIG.usdRate +
          " to $1. The final price is confirmed with you before any work starts."
        : "All prices are in Nepali rupees.";
  }
  curBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setCurrency(b.getAttribute("data-cur"));
    });
  });

  /* Service buttons fill the form */
  var serviceSelect = $("#fService");
  $$(".pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      serviceSelect.value = btn.getAttribute("data-service");
      var target = $("#contact");
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(
        function () {
          $("#fName").focus({ preventScroll: true });
        },
        reduceMotion ? 0 : 500,
      );
    });
  });

  /* Copy buttons */
  $$(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var what = btn.getAttribute("data-what");
      var done = function () {
        toast(what + " copied");
      };
      var fail = function () {
        toast("Could not copy. Select the text and copy it by hand.");
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, fail);
      } else {
        var tmp = document.createElement("textarea");
        tmp.value = value;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "absolute";
        tmp.style.left = "-9999px";
        document.body.appendChild(tmp);
        tmp.select();
        try {
          document.execCommand("copy") ? done() : fail();
        } catch (e) {
          fail();
        }
        document.body.removeChild(tmp);
      }
    });
  });

  /* Contact form: validates, then opens the visitor's email app with the message filled in */
  var form = $("#contactForm");
  var status = $("#formStatus");

  function setError(fieldId, errId, message) {
    var input = document.getElementById(fieldId);
    var err = document.getElementById(errId);
    err.textContent = message;
    input.closest(".field").classList.toggle("invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    var name = $("#fName").value.trim();
    var email = $("#fEmail").value.trim();
    var service = serviceSelect.value;
    var message = $("#fMessage").value.trim();

    var okName = setError("fName", "errName", name ? "" : "Enter your name.");
    var okEmail = setError(
      "fEmail",
      "errEmail",
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
        ? ""
        : "Enter an email address like name@example.com.",
    );
    var okMsg = setError(
      "fMessage",
      "errMessage",
      message.length >= 10
        ? ""
        : "Describe what you need in at least 10 characters.",
    );

    if (!(okName && okEmail && okMsg)) {
      var firstBad = $('[aria-invalid="true"]', form);
      if (firstBad) firstBad.focus();
      return;
    }

    var subject = "Enquiry: " + service + " (from " + name + ")";
    var body =
      "Name: " +
      name +
      "\nEmail: " +
      email +
      "\nService: " +
      service +
      "\n\n" +
      message;
    window.location.href =
      "mailto:" +
      CONFIG.email +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    status.textContent =
      "Your email app should open with the message ready to send. If nothing opens, write to " +
      CONFIG.email +
      " directly.";
  });

  ["fName", "fEmail", "fMessage"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      var errId = "err" + id.slice(1);
      setError(id, errId, "");
    });
  });

  /* Footer year */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
