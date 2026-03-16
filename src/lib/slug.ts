
const diacriticsMap: { [k: string]: string } = {
  "à": "a","á":"a","ä":"a","â":"a","ã":"a",
  "è":"e","é":"e","ë":"e","ê":"e",
  "ì":"i","í":"i","ï":"i","î":"i",
  "ò":"o","ó":"o","ö":"o","ô":"o","õ":"o",
  "ù":"u","ú":"u","ü":"u","û":"u",
  "ñ":"n","ç":"c"
};

function removeDiacritics(s: string) {
  return s.replace(/[^\u0000-\u007E]/g, (a) => diacriticsMap[a] || "");
}

export function createSlug(title: string, maxLen = 70) {
  if (!title) return "item";
  let s = title.trim().toLowerCase();
  s = removeDiacritics(s);
  // replace anything that's not a-z0-9 with hyphen
  s = s.replace(/[^a-z0-9]+/g, "-");
  s = s.replace(/-+/g, "-"); // collapse
  s = s.replace(/(^-|-$)/g, ""); // trim
  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
    s = s.replace(/-?[^-]*$/g, ""); // cut off partial word
  }
  return s || "item";
}