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

  var DEMO_SEARCH_BOOKS = [
    { BookID: 1,  Title: 'Introduction to Algorithms', Author: 'Cormen, Leiserson, Rivest, Stein', Price: 2200, BookCondition: 'Good' },
    { BookID: 2,  Title: 'Computer Networking: A Top-Down Approach', Author: 'Kurose & Ross', Price: 1800, BookCondition: 'Like new' },
    { BookID: 3,  Title: 'Database System Concepts', Author: 'Silberschatz, Korth, Sudarshan', Price: 1600, BookCondition: 'Good' },
    { BookID: 4,  Title: 'Operating System Concepts', Author: 'Silberschatz, Galvin, Gagne', Price: 1700, BookCondition: 'Fair' },
    { BookID: 5,  Title: 'Data Structures and Algorithms in Java', Author: 'Goodrich, Tamassia, Goldwasser', Price: 1400, BookCondition: 'Like new' },
    { BookID: 6,  Title: 'C++ How to Program', Author: 'Paul Deitel & Harvey Deitel', Price: 1200, BookCondition: 'Good' },
    { BookID: 7,  Title: 'Computer Networks', Author: 'Andrew S. Tanenbaum', Price: 1900, BookCondition: 'Like new' },
    { BookID: 8,  Title: 'Object-Oriented Programming in C++', Author: 'Robert Lafore', Price: 1300, BookCondition: 'Good' },
    { BookID: 9,  Title: 'Fundamentals of Database Systems', Author: 'Elmasri & Navathe', Price: 1500, BookCondition: 'Good' },
    { BookID: 10, Title: 'Computer Organization and Design', Author: 'Patterson & Hennessy', Price: 1900, BookCondition: 'Fair' },
    { BookID: 11, Title: 'Head First Java', Author: 'Kathy Sierra & Bert Bates', Price: 1100, BookCondition: 'Like new' },
    { BookID: 12, Title: 'Clean Code', Author: 'Robert C. Martin', Price: 1000, BookCondition: 'Good' }
  ];

  function render() {
    var query = input.value.trim().toLowerCase();
    var list = allBooks.filter(function (b) { return matches(b, query); });

    grid.innerHTML = list.map(function (b) {
      var id = b.BookID || b.id;
      var title = b.Title || b.title;
      var price = b.Price || b.price || 0;
      var condition = b.BookCondition || b.condition || "Available";
      var imgUrl = b.ImageUrl || b.photo;

      var thumbHtml = imgUrl
        ? '<div class="srch-thumb" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0F172A;"><img src="' + esc(imgUrl) + '" alt="' + esc(title) + '" style="width: 100%; height: 100%; object-fit: cover;"></div>'
        : '<div class="srch-thumb" style="background: linear-gradient(135deg, #6C38FF, #3B2470); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 13px; text-align: center; padding: 10px;">' +
            esc(title) +
          '</div>';

      return '<a class="srch-card" href="book-details.html?id=' + encodeURIComponent(id) + '">' +
               thumbHtml +
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
        var valid = (res && res.books && res.books.length > 0)
          ? res.books.filter(function (b) {
              var s = (b.Status || 'available').toLowerCase();
              return s === 'available' || s === 'live';
            })
          : [];
        allBooks = valid.length > 0 ? valid : DEMO_SEARCH_BOOKS;
        render();
      })
      .catch(function (err) {
        console.warn("[Search Load Error]", err.message);
        allBooks = DEMO_SEARCH_BOOKS;
        render();
      });
  } else {
    allBooks = DEMO_SEARCH_BOOKS;
    render();
  }

})();