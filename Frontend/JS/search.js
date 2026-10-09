/* SEARCH PAGE: live search (results update while typing).
   "BOOKS" is placeholder data shaped like a real API response.
   When the backend is ready, replace getBooks() with a fetch() call. */

(function () {
  "use strict";

  var SUBJECT_LABELS = {
    programming: "Programming", maths: "Mathematics", physics: "Physics", english: "English",
    python: "Python", stats: "Statistics", ml: "Machine Learning", ds: "Data Structures",
    os: "Operating Systems", db: "Databases"
  };

  var DEPT_LABELS = {
    se: "Software Engineering",
    ai: "Artificial Intelligence",
    cs: "Computer Science"
  };

  function getBooks() {
    // future: return fetch("/api/books").then(function (r) { return r.json(); });
    return [
      { id: 1,  title: "Introduction to Programming",  price: 850,  sub: "programming", depts: ["se", "cs"] },
      { id: 2,  title: "Calculus & Analytic Geometry", price: 600,  sub: "maths",       depts: ["se"] },
      { id: 3,  title: "Intro to Machine Learning",    price: 1200, sub: "ml",          depts: ["ai"] },
      { id: 4,  title: "Applied Physics",              price: 550,  sub: "physics",     depts: ["se"] },
      { id: 5,  title: "Data Structures & Algorithms", price: 900,  sub: "ds",          depts: ["cs"] },
      { id: 6,  title: "Linear Algebra",               price: 500,  sub: "maths",       depts: ["ai"] },
      { id: 7,  title: "Operating Systems Concepts",   price: 750,  sub: "os",          depts: ["cs"] },
      { id: 8,  title: "Database Systems",             price: 700,  sub: "db",          depts: ["cs"] },
      { id: 9,  title: "English Composition",          price: 400,  sub: "english",     depts: ["se"] },
      { id: 10, title: "Python Programming",           price: 650,  sub: "python",      depts: ["ai"] },
      { id: 11, title: "Probability & Statistics",     price: 580,  sub: "stats",       depts: ["ai"] }
    ];
  }

  var books = getBooks();
  var params = new URLSearchParams(window.location.search);
  var dept = params.get("dept");
  var sub = params.get("sub");

  var input = document.getElementById("srchInput");
  var grid = document.getElementById("srchGrid");
  var count = document.getElementById("srchCount");
  var empty = document.getElementById("srchEmpty");
  var note = document.getElementById("srchNote");

  function esc(value) {
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  function matches(book, query) {
    if (dept && book.depts.indexOf(dept) === -1) return false;
    if (sub && book.sub !== sub) return false;
    if (!query) return true;
    var subjectName = (SUBJECT_LABELS[book.sub] || "").toLowerCase();
    return book.title.toLowerCase().indexOf(query) !== -1 || subjectName.indexOf(query) !== -1;
  }

  function render() {
    var query = input.value.trim().toLowerCase();
    var list = books.filter(function (b) { return matches(b, query); });

    grid.innerHTML = list.map(function (b) {
      return '<a class="srch-card" href="book-details.html?id=' + encodeURIComponent(b.id) + '">' +
               '<div class="srch-thumb"></div>' +
               '<h4 class="srch-title">' + esc(b.title) + '</h4>' +
               '<div class="srch-meta">' +
                 '<span class="srch-price">Rs. ' + esc(b.price) + '</span>' +
                 '<span class="srch-tag">' + esc(SUBJECT_LABELS[b.sub] || b.sub) + '</span>' +
               '</div>' +
             '</a>';
    }).join("");

    empty.hidden = list.length !== 0;
    count.textContent = list.length === 0
      ? "No results"
      : "Showing " + list.length + " book" + (list.length === 1 ? "" : "s");
  }

  /* show the active category (coming from the category page) */
  if (dept || sub) {
    var parts = [];
    if (dept && DEPT_LABELS[dept]) parts.push(DEPT_LABELS[dept]);
    if (sub && SUBJECT_LABELS[sub]) parts.push(SUBJECT_LABELS[sub]);
    note.innerHTML = "Category: " + esc(parts.join(" · ")) + ' <a href="search.html">Show all</a>';
    note.hidden = false;
  }

  /* keyword typed in the navbar search on other pages (?q=...) */
  var q = params.get("q");
  if (q) input.value = q;

  input.addEventListener("input", render);
  render();

  /* navbar: mobile menu button */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* navbar: cart count */
  try {
    var cart = JSON.parse(localStorage.getItem("bookswap_cart") || "[]");
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = total;
  } catch (err) {
    /* ignore storage errors */
  }
})();