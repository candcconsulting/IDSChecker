import synonyms from './synonyms.json';

// This method can be mocked in unit-tests
/*
export const getSynonyms = (): Record<string, string[]> =>
  <Record<string, string[]>>synonyms;
*/
type SynonymLibrary = Record<string , string[]>;
type Synonyms = Record<string, SynonymLibrary>;

export const getSynonyms = (library: string = "default"): SynonymLibrary => {
  if (library === "")
    library = "default";
  return synonyms[library as keyof typeof synonyms];
};



export const getKeys = (): string[] => Object.keys(synonyms);

/**
 * Returns a list of synonyms of  the given word, if no synonyms were found, it will return an empty array.
 * @param word
 */
export const synonym = (word: string, library = ""): string[] => {
  const allSynonyms = getSynonyms(library)[word] || [];
  if (allSynonyms.length === 0) {
    allSynonyms.push(word);
  }
  return allSynonyms
};

/**
 * Search for a specific substring to see if it's in the synonym list.
 * @param substring
 */
export const search = (substring: string): string[] => {
  return getKeys().filter((entry) => entry.includes(substring));
};