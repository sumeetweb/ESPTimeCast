const MAX_CUSTOM_MESSAGE_LENGTH = 120;
const SUPPORTED_PATTERN = /[A-Za-z0-9 !.?:,;'"_\-+%/[\]()#&$;|@^~*=<>\t\n\r\\{}]/;

const INDEPENDENT_VOWELS = new Map([
  ["अ", "a"],
  ["आ", "aa"],
  ["इ", "i"],
  ["ई", "ee"],
  ["उ", "u"],
  ["ऊ", "oo"],
  ["ए", "e"],
  ["ऐ", "ai"],
  ["ओ", "o"],
  ["औ", "au"],
  ["ऋ", "ri"]
]);

const CONSONANTS = new Map([
  ["क", "k"],
  ["ख", "kh"],
  ["ग", "g"],
  ["घ", "gh"],
  ["ङ", "n"],
  ["च", "ch"],
  ["छ", "chh"],
  ["ज", "j"],
  ["झ", "jh"],
  ["ञ", "n"],
  ["ट", "t"],
  ["ठ", "th"],
  ["ड", "d"],
  ["ढ", "dh"],
  ["ण", "n"],
  ["त", "t"],
  ["थ", "th"],
  ["द", "d"],
  ["ध", "dh"],
  ["न", "n"],
  ["प", "p"],
  ["फ", "ph"],
  ["ब", "b"],
  ["भ", "bh"],
  ["म", "m"],
  ["य", "y"],
  ["र", "r"],
  ["ल", "l"],
  ["व", "v"],
  ["श", "sh"],
  ["ष", "sh"],
  ["स", "s"],
  ["ह", "h"],
  ["ळ", "l"]
]);

const VOWEL_SIGNS = new Map([
  ["ा", "a"],
  ["ि", "i"],
  ["ी", "ee"],
  ["ु", "u"],
  ["ू", "oo"],
  ["े", "e"],
  ["ै", "ai"],
  ["ो", "o"],
  ["ौ", "au"],
  ["ृ", "ri"]
]);

const MARKS = new Map([
  ["ं", "n"],
  ["ँ", "n"],
  ["ः", "h"]
]);

const VIRAMA = "्";
const NUKTA = "़";

export function toDisplayText(input) {
  return stripUnsupported(
    transliterateDevanagari(String(input || ""))
      .normalize("NFKD")
      .replace(/œ/g, "oe")
      .replace(/Œ/g, "OE")
      .replace(/æ/g, "ae")
      .replace(/Æ/g, "AE")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/[–—]/g, "-")
      .replace(/&/g, " AND ")
      .replace(/\s+/g, " ")
      .trim()
  )
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, MAX_CUSTOM_MESSAGE_LENGTH);
}

function transliterateDevanagari(text) {
  let output = "";

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (INDEPENDENT_VOWELS.has(char)) {
      output += INDEPENDENT_VOWELS.get(char);
      continue;
    }

    if (CONSONANTS.has(char)) {
      output += CONSONANTS.get(char);

      if (next === NUKTA) {
        i += 1;
      }

      if (VOWEL_SIGNS.has(text[i + 1])) {
        output += VOWEL_SIGNS.get(text[i + 1]);
        i += 1;
      } else if (text[i + 1] === VIRAMA) {
        i += 1;
      } else if (shouldAddInherentA(text[i + 1])) {
        output += "a";
      }

      continue;
    }

    if (VOWEL_SIGNS.has(char)) {
      output += VOWEL_SIGNS.get(char);
      continue;
    }

    if (MARKS.has(char)) {
      output += MARKS.get(char);
      continue;
    }

    if (char === VIRAMA || char === NUKTA) continue;

    output += char;
  }

  return output;
}

function shouldAddInherentA(next) {
  return CONSONANTS.has(next);
}

function stripUnsupported(text) {
  let output = "";
  for (const char of text) {
    output += SUPPORTED_PATTERN.test(char) ? char : " ";
  }
  return output;
}
