/* ==========================================================================
   BOOKSWAP - search.js
   Live search connected to Backend API (GET /api/listings & GET /api/search)
   ========================================================================== */

(function () {
  "use strict";

  var input = document.getElementById("srchInput");
  var grid = document.getElementById("srchGrid");
  var count = document.getElementById("srchCount");
  var empty = document.getElementById("srchEmpty");
  var note = document.getElementById("srchNote");

  var allBooks = [];

  function esc(value) {
    var div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  function matches(book, query) {
    if (!query) return true;
    var title = (book.Title || book.title || "").toLowerCase();
    var author = (book.Author || book.author || "").toLowerCase();
    var desc = (book.Description || book.description || "").toLowerCase();
    return title.indexOf(query) !== -1 || author.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
  }

  function render() {
    var query = input.value.trim().toLowerCase();
    var list = allBooks.filter(function (b) { return matches(b, query); });

    grid.innerHTML = list.map(function (b) {
      var id = b.BookID || b.id;
      var title = b.Title || b.title;
      var price = b.Price || b.price || 0;
      var condition = b.BookCondition || b.condition || "Available";

      return '<a class="srch-card" href="book-details.html?id=' + encodeURIComponent(id) + '">' +
               '<div class="srch-thumb" style="background: linear-gradient(135deg, #6C38FF, #3B2470); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 13px; text-align: center; padding: 10px;">' +
                 esc(title) +
               '</div>' +
               '<h4 class="srch-title">' + esc(title) + '</h4>' +
               '<div class="srch-meta">' +
                 '<span class="srch-price">Rs. ' + esc(Number(price).toLocaleString("en-PK")) + '</span>' +
                 '<span class="srch-tag">' + esc(condition) + '</span>' +
               '</div>' +
             '</a>';
    }).join("");

    empty.hidden = list.length !== 0;
    count.textContent = list.length === 0
      ? "No results found"
      : "Showing " + list.length + " book" + (list.length === 1 ? "" : "s");
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");
  if (q) input.value = q;

  input.addEventListener("input", render);

  // Load books from Backend API
  if (window.BookSwapAPI) {
    window.BookSwapAPI.listings.getAll()
      .then(function (res) {
        allBooks = res.books || [];
        render();
      })
      .catch(function (err) {
        console.warn("[Search Load Error]", err.message);
        count.textContent = "Failed to load books from server.";
      });
  } else {
    count.textContent = "Search ready.";
  }

})();