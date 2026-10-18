/* ==========================================================================
   BOOKSWAP - avatar.js
   Creative Student Cartoon Avatars (Boy & Girl styles)
   Deterministic mapping by name & gender detection for Pakistani/student names
   ========================================================================== */

(function (window) {
  "use strict";

  var FEMALE_NAMES = [
    "ayesha", "fatima", "zara", "sara", "sarah", "maryam", "marium", "hira",
    "hina", "areeba", "alina", "aleena", "khadija", "zainab", "noor", "sana",
    "laiba", "anum", "iqra", "maha", "bano", "begum", "kiran", "mahnoor",
    "nimra", "rabia", "sadia", "samina", "shazia", "sidra", "sumaira",
    "tahira", "uzma", "bushra", "anila", "maria", "amna", "kinza", "maliha",
    "fiza", "mehak", "natasha", "anaya", "hoorain", "jaweria", "mehwish",
    "bisma", "dua", "hafsa", "iman", "eman", "urooj", "komal", "sonia"
  ];

  var MALE_NAMES = [
    "ahmed", "ahmad", "ali", "bilal", "usman", "uthman", "hamza", "saad",
    "taha", "danish", "daniyal", "danial", "zain", "hassan", "hasan", "hussein",
    "hussain", "omer", "umar", "umair", "asad", "fahad", "mustafa", "farhan",
    "ibrahim", "kamran", "kashif", "nadeem", "noman", "nouman", "rizwan",
    "salman", "shahid", "sohail", "tariq", "waqas", "yasir", "zubair",
    "abdullah", "abdul", "babar", "junaid", "mohammad", "muhammad", "shahzaib",
    "haris", "arslan", "rehan", "adeel", "owais", "faizan", "hamid", "waheed"
  ];

  /* 6 Distinct Creative Student Cartoon SVGs (3 Boys, 3 Girls) */
  var AVATARS = {
    // Boy 1: Smart student with spectacles & stylish hair
    boy1: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="b1_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#3B82F6"/>' +
            '<stop offset="100%" stop-color="#1D4ED8"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#b1_bg)"/>' +
        '<!-- Hoodie / Shoulders -->' +
        '<path d="M22 96 C22 75, 36 68, 50 68 C64 68, 78 75, 78 96 Z" fill="#F1F5F9"/>' +
        '<path d="M38 72 L50 86 L62 72 Z" fill="#E2E8F0"/>' +
        '<path d="M48 76 L50 96 L52 76 Z" stroke="#3B82F6" stroke-width="2"/>' +
        '<!-- Neck -->' +
        '<rect x="44" y="56" width="12" height="15" rx="3" fill="#FCD34D"/>' +
        '<!-- Face -->' +
        '<ellipse cx="50" cy="46" rx="20" ry="21" fill="#FDE68A"/>' +
        '<!-- Ears -->' +
        '<circle cx="29" cy="46" r="4.5" fill="#FCD34D"/>' +
        '<circle cx="71" cy="46" r="4.5" fill="#FCD34D"/>' +
        '<!-- Hair (Short modern side part) -->' +
        '<path d="M28 41 C27 28, 40 20, 56 22 C68 23, 73 30, 72 38 C68 31, 60 28, 50 28 C39 28, 31 34, 28 41 Z" fill="#1E293B"/>' +
        '<!-- Eyebrows -->' +
        '<path d="M36 37 Q41 34 45 37" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '<path d="M55 37 Q59 34 64 37" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '<!-- Glasses -->' +
        '<rect x="33" y="39" width="13" height="10" rx="3" fill="rgba(255,255,255,0.4)" stroke="#0F172A" stroke-width="2"/>' +
        '<rect x="54" y="39" width="13" height="10" rx="3" fill="rgba(255,255,255,0.4)" stroke="#0F172A" stroke-width="2"/>' +
        '<line x1="46" y1="44" x2="54" y2="44" stroke="#0F172A" stroke-width="2"/>' +
        '<!-- Eyes -->' +
        '<circle cx="39.5" cy="44" r="2.2" fill="#0F172A"/>' +
        '<circle cx="60.5" cy="44" r="2.2" fill="#0F172A"/>' +
        '<circle cx="40.2" cy="43.2" r="0.7" fill="#FFF"/>' +
        '<circle cx="61.2" cy="43.2" r="0.7" fill="#FFF"/>' +
        '<!-- Cheerful Smile -->' +
        '<path d="M43 55 Q50 61 57 55" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '</svg>';
    },

    // Boy 2: College student with polo shirt & spiky energetic hair
    boy2: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="b2_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#10B981"/>' +
            '<stop offset="100%" stop-color="#047857"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#b2_bg)"/>' +
        '<!-- Polo Collar -->' +
        '<path d="M22 96 C22 75, 36 67, 50 67 C64 67, 78 75, 78 96 Z" fill="#065F46"/>' +
        '<path d="M42 67 L50 82 L58 67 Z" fill="#F8FAFC"/>' +
        '<!-- Neck -->' +
        '<rect x="44" y="55" width="12" height="15" rx="3" fill="#FBBF24"/>' +
        '<!-- Face -->' +
        '<ellipse cx="50" cy="45" rx="20" ry="21" fill="#FDE68A"/>' +
        '<!-- Ears -->' +
        '<circle cx="29" cy="45" r="4.5" fill="#FBBF24"/>' +
        '<circle cx="71" cy="45" r="4.5" fill="#FBBF24"/>' +
        '<!-- Hair (Messy spikes) -->' +
        '<path d="M27 40 C28 27, 36 18, 50 17 C64 18, 72 26, 73 39 C67 34, 63 32, 57 32 C51 32, 49 26, 42 28 C36 30, 32 35, 27 40 Z" fill="#451A03"/>' +
        '<!-- Eyes -->' +
        '<circle cx="41" cy="43" r="2.8" fill="#1E293B"/>' +
        '<circle cx="59" cy="43" r="2.8" fill="#1E293B"/>' +
        '<circle cx="42" cy="42" r="0.9" fill="#FFF"/>' +
        '<circle cx="60" cy="42" r="0.9" fill="#FFF"/>' +
        '<!-- Eyebrows -->' +
        '<path d="M37 36 Q42 33 46 36" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '<path d="M54 36 Q58 33 63 36" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '<!-- Cute Nose & Smile -->' +
        '<circle cx="50" cy="49" r="1.5" fill="#F59E0B"/>' +
        '<path d="M42 54 Q50 61 58 54" stroke="#92400E" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '</svg>';
    },

    // Boy 3: Creative student with hoodie & cool headphones
    boy3: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="b3_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#8B5CF6"/>' +
            '<stop offset="100%" stop-color="#5B21B6"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#b3_bg)"/>' +
        '<!-- Orange Hoodie -->' +
        '<path d="M22 96 C22 74, 36 67, 50 67 C64 67, 78 74, 78 96 Z" fill="#F97316"/>' +
        '<path d="M42 67 L50 82 L58 67 Z" fill="#EA580C"/>' +
        '<!-- Neck -->' +
        '<rect x="44" y="55" width="12" height="15" rx="3" fill="#FCD34D"/>' +
        '<!-- Face -->' +
        '<ellipse cx="50" cy="45" rx="19.5" ry="20" fill="#FDE68A"/>' +
        '<!-- Hair (Curly textured) -->' +
        '<path d="M29 38 C26 25, 36 17, 50 17 C64 17, 73 25, 71 38 C67 33, 62 30, 50 30 C38 30, 33 33, 29 38 Z" fill="#172554"/>' +
        '<!-- Headphones band -->' +
        '<path d="M26 44 C26 23, 74 23, 74 44" stroke="#0F172A" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<rect x="23" y="40" width="7" height="14" rx="3" fill="#38BDF8"/>' +
        '<rect x="70" y="40" width="7" height="14" rx="3" fill="#38BDF8"/>' +
        '<!-- Eyes with playful squint -->' +
        '<path d="M38 43 Q42 41 45 44" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
        '<path d="M55 44 Q58 41 62 43" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
        '<!-- Big Smile with teeth -->' +
        '<path d="M42 52 Q50 62 58 52 Z" fill="#991B1B"/>' +
        '<path d="M45 53 Q50 56 55 53 Z" fill="#FFF"/>' +
      '</svg>';
    },

    // Girl 1: College girl with glasses, ponytail & cute student hairpin
    girl1: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="g1_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#EC4899"/>' +
            '<stop offset="100%" stop-color="#BE185D"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#g1_bg)"/>' +
        '<!-- Ponytail on side -->' +
        '<path d="M68 34 C80 32, 85 46, 80 58 C76 66, 70 60, 68 52 Z" fill="#451A03"/>' +
        '<circle cx="70" cy="40" r="4" fill="#F43F5E"/>' +
        '<!-- Blouse / Sweater -->' +
        '<path d="M22 96 C22 75, 36 68, 50 68 C64 68, 78 75, 78 96 Z" fill="#EDE9FE"/>' +
        '<path d="M40 68 Q50 78 60 68 Z" fill="#C4B5FD"/>' +
        '<!-- Neck -->' +
        '<rect x="44" y="55" width="12" height="15" rx="3" fill="#FCD34D"/>' +
        '<!-- Face -->' +
        '<ellipse cx="50" cy="45" rx="19" ry="20" fill="#FEF08A"/>' +
        '<!-- Ears -->' +
        '<circle cx="30" cy="46" r="3.8" fill="#FCD34D"/>' +
        '<circle cx="70" cy="46" r="3.8" fill="#FCD34D"/>' +
        '<!-- Hair (Bangs & sides) -->' +
        '<path d="M28 42 C26 27, 36 19, 50 19 C64 19, 74 27, 72 42 C68 33, 58 31, 50 31 C40 31, 33 34, 28 42 Z" fill="#451A03"/>' +
        '<path d="M30 38 Q40 28 50 33" stroke="#451A03" stroke-width="6" stroke-linecap="round" fill="none"/>' +
        '<!-- Student Hair Clip -->' +
        '<polygon points="32,27 38,24 38,30" fill="#FBBF24"/>' +
        '<!-- Glasses -->' +
        '<circle cx="40" cy="43" r="7.5" fill="rgba(255,255,255,0.4)" stroke="#BE185D" stroke-width="2"/>' +
        '<circle cx="60" cy="43" r="7.5" fill="rgba(255,255,255,0.4)" stroke="#BE185D" stroke-width="2"/>' +
        '<line x1="47.5" y1="43" x2="52.5" y2="43" stroke="#BE185D" stroke-width="2"/>' +
        '<!-- Eyes -->' +
        '<circle cx="40" cy="43" r="2.4" fill="#0F172A"/>' +
        '<circle cx="60" cy="43" r="2.4" fill="#0F172A"/>' +
        '<circle cx="40.8" cy="42.2" r="0.8" fill="#FFF"/>' +
        '<circle cx="60.8" cy="42.2" r="0.8" fill="#FFF"/>' +
        '<!-- Cheeks -->' +
        '<circle cx="34" cy="49" r="3" fill="#FDA4AF" opacity="0.6"/>' +
        '<circle cx="66" cy="49" r="3" fill="#FDA4AF" opacity="0.6"/>' +
        '<!-- Sweet Smile -->' +
        '<path d="M43 54 Q50 60 57 54" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '</svg>';
    },

    // Girl 2: Cheerful student with wavy hair & cute expression
    girl2: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="g2_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#14B8A6"/>' +
            '<stop offset="100%" stop-color="#0F766E"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#g2_bg)"/>' +
        '<!-- Long Wavy Hair Behind -->' +
        '<path d="M25 45 C22 65, 26 80, 32 90 C36 82, 34 68, 36 55 Z" fill="#1C1917"/>' +
        '<path d="M75 45 C78 65, 74 80, 68 90 C64 82, 66 68, 64 55 Z" fill="#1C1917"/>' +
        '<!-- Cardigan -->' +
        '<path d="M22 96 C22 75, 36 67, 50 67 C64 67, 78 75, 78 96 Z" fill="#FEF3C7"/>' +
        '<path d="M42 67 L50 82 L58 67 Z" fill="#F59E0B"/>' +
        '<!-- Neck -->' +
        '<rect x="44" y="55" width="12" height="15" rx="3" fill="#FCD34D"/>' +
        '<!-- Face -->' +
        '<ellipse cx="50" cy="45" rx="19" ry="20" fill="#FEF08A"/>' +
        '<!-- Front Hair Volume -->' +
        '<path d="M26 38 C28 24, 38 18, 50 18 C62 18, 72 24, 74 38 C68 30, 62 28, 50 28 C38 28, 32 30, 26 38 Z" fill="#1C1917"/>' +
        '<path d="M26 38 C28 48, 32 55, 34 60 C36 53, 34 45, 32 38 Z" fill="#1C1917"/>' +
        '<path d="M74 38 C72 48, 68 55, 66 60 C64 53, 66 45, 68 38 Z" fill="#1C1917"/>' +
        '<!-- Eyes (Friendly sparkle) -->' +
        '<circle cx="41" cy="43" r="2.8" fill="#1E293B"/>' +
        '<circle cx="59" cy="43" r="2.8" fill="#1E293B"/>' +
        '<circle cx="42" cy="42" r="1" fill="#FFF"/>' +
        '<circle cx="60" cy="42" r="1" fill="#FFF"/>' +
        '<!-- Cute Eyebrows -->' +
        '<path d="M37 36 Q41 33 45 36" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<path d="M55 36 Q59 33 63 36" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<!-- Cheeks -->' +
        '<circle cx="34" cy="48" r="3.2" fill="#F472B6" opacity="0.55"/>' +
        '<circle cx="66" cy="48" r="3.2" fill="#F472B6" opacity="0.55"/>' +
        '<!-- Warm Smile -->' +
        '<path d="M43 53 Q50 60 57 53" stroke="#92400E" stroke-width="2.3" stroke-linecap="round" fill="none"/>' +
      '</svg>';
    },

    // Girl 3: Elegant student with hijab / dupatta scarf & gentle warm smile
    girl3: function (sz) {
      return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="g3_bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#6366F1"/>' +
            '<stop offset="100%" stop-color="#4338CA"/>' +
          '</linearGradient>' +
          '<linearGradient id="g3_scarf" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#DDD6FE"/>' +
            '<stop offset="100%" stop-color="#C4B5FD"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#g3_bg)"/>' +
        '<!-- Hijab Outer Shape / Shoulders -->' +
        '<path d="M20 96 C20 72, 34 62, 50 62 C66 62, 80 72, 80 96 Z" fill="url(#g3_scarf)"/>' +
        '<path d="M25 46 C25 24, 75 24, 75 46 C75 66, 68 76, 50 76 C32 76, 25 66, 25 46 Z" fill="url(#g3_scarf)"/>' +
        '<!-- Face Cutout Inside Hijab -->' +
        '<ellipse cx="50" cy="47" rx="16.5" ry="18" fill="#FEF08A"/>' +
        '<!-- Scarf folds -->' +
        '<path d="M34 64 Q50 74 66 64" stroke="#8B5CF6" stroke-width="2" fill="none"/>' +
        '<path d="M46 72 Q50 86 54 72" stroke="#8B5CF6" stroke-width="2" fill="none"/>' +
        '<!-- Beautiful Almond Eyes -->' +
        '<ellipse cx="43" cy="45" rx="3.2" ry="2.2" fill="#1E293B"/>' +
        '<ellipse cx="57" cy="45" rx="3.2" ry="2.2" fill="#1E293B"/>' +
        '<circle cx="44" cy="44.2" r="0.9" fill="#FFF"/>' +
        '<circle cx="58" cy="44.2" r="0.9" fill="#FFF"/>' +
        '<!-- Gentle Eyebrows -->' +
        '<path d="M39 39 Q43 36 47 39" stroke="#5B21B6" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        '<path d="M53 39 Q57 36 61 39" stroke="#5B21B6" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        '<!-- Soft blush cheeks -->' +
        '<circle cx="37" cy="50" r="2.8" fill="#F472B6" opacity="0.6"/>' +
        '<circle cx="63" cy="50" r="2.8" fill="#F472B6" opacity="0.6"/>' +
        '<!-- Kind Smile -->' +
        '<path d="M45 54 Q50 59 55 54" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '</svg>';
    }
  };

  /* Helper to hash string deterministically */
  function hashString(str) {
    var hash = 0;
    if (!str) return hash;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /* Detect gender from name */
  function detectGender(name) {
    if (!name) return "male";
    var clean = name.toLowerCase().trim();
    var parts = clean.split(/[\s._-]+/);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (FEMALE_NAMES.indexOf(p) !== -1) return "female";
      if (MALE_NAMES.indexOf(p) !== -1) return "male";
    }
    return null; // fallback to hash
  }

  /* Get avatar key for user */
  function getAvatarKey(name) {
    var gender = detectGender(name);
    var h = hashString(name);

    if (gender === "female") {
      var fOptions = ["girl1", "girl2", "girl3"];
      return fOptions[h % fOptions.length];
    } else if (gender === "male") {
      var mOptions = ["boy1", "boy2", "boy3"];
      return mOptions[h % mOptions.length];
    }

    var allOptions = ["boy1", "girl1", "boy2", "girl2", "boy3", "girl3"];
    return allOptions[h % allOptions.length];
  }

  /* Public API */
  var AvatarHelper = {
    getAvatarSvg: function (name, size) {
      size = size || "100%";
      var key = getAvatarKey(name);
      return (AVATARS[key] || AVATARS.boy1)(size);
    },

    createAvatarEl: function (name, className, size) {
      var span = document.createElement("span");
      span.className = className || "chat-avatar";
      span.innerHTML = this.getAvatarSvg(name, size || "100%");
      return span;
    },

    insertAvatar: function (el, name, size) {
      if (!el) return;
      el.innerHTML = this.getAvatarSvg(name, size || "100%");
    }
  };

  window.BookSwapAvatars = AvatarHelper;

})(window);
