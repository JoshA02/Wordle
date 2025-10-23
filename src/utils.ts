const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

/**
   * Validates a word using the dictionary API
   * @param word word to validate
   * @param signal abort signal to cancel fetch; optional
   * @returns true if word is valid, false otherwise
   * @throws AbortError if fetch is aborted
   */
export async function validateWord(word: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(DICT_API + word, {signal});
    if (!response.ok) {
      throw new Error('Failed to validate word');
    }
    return true;
  } catch(error: any) {
    if (error.name === 'AbortError') {
      throw error; // re-throw abort errors to be handled by caller
    }
    console.error('Error validating the word:', error);
    return false;
  }
}