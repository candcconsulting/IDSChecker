import {synonym} from "./synonyms"

export const thesaurus = (phrase : string)  => {
  phrase = phrase.replaceAll('-', ' ');
  phrase = phrase.replaceAll('_', ' ');
  let returnPhrase = phrase;

  const wordsArray = returnPhrase.split(" ")
  for (const aWord in wordsArray) {  
    const synonyms = synonym(wordsArray[aWord])
    returnPhrase = returnPhrase.replaceAll(wordsArray[aWord], synonyms.join(" "));
    returnPhrase = returnPhrase + " " + wordsArray[aWord];
  }
  
  return returnPhrase
}