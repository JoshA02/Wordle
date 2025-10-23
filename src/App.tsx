import {useEffect, useRef, useState} from 'react'
import './App.css'
import Guess from './components/Guess';
import {validateWord} from './utils';

function App() {

  // state variables
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [solution, setSolution] = useState('');
  const validGuess = useRef(0); // -1 = checking, 0 = invalid, 1 = valid
  const validGuessAbortController = useRef<AbortController | null>(null);

  // constants
  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;
  const WORD_API = 'https://random-word-api.herokuapp.com/word?length=5';

  // runs on component mount; fetch a random word from API
  useEffect(() => {
    async function fetchSolution() {
      try {
        const response = await fetch(WORD_API);
        const data = await response.json();
        const word = data[0].toLowerCase();
        
        // ensure word is valid before setting as solution:
        const isValid = await validateWord(word);
        if (!isValid) {
          console.log('Fetched word "' + word + '" is not valid. Fetching a new word...');
          fetchSolution();
          return;
        }

        console.log('Fetched solution word:', word);
        setSolution(data[0].toLowerCase());
      } catch (error) {
        console.error('Error fetching the solution word:', error);
        alert('Error fetching the solution word. Please refresh the page to try again.');
      }
    }
    fetchSolution();
  }, [])
  

  useEffect(() => {
    function submitGuess() {
      // submit guess
      if (currentGuess.length === WORD_LENGTH && guesses.length < MAX_GUESSES && !gameOver) {

        // ensure solution is loaded
        if (!solution) {
          alert('Solution not loaded yet. Please wait a moment and try again.');
          return;
        }

        // check if guess is correct
        if (currentGuess === solution) {
          alert('Congratulations! You guessed the word!');
          setGameOver(true);
          return;
        }

        // if not, check if they just made their last (incorrect) guess
        if (guesses.length + 1 === MAX_GUESSES) {
          setGuesses([...guesses, currentGuess]);
          alert(`Game Over! The correct word was "${solution}".`);
          setGameOver(true);
          return;
        }

        setGuesses([...guesses, currentGuess]);
        setCurrentGuess('');
      }
    }

    // handle key presses
    function handleKeyPress(event: KeyboardEvent) {
      const key = event.key;

      if (key === 'Enter') {
        
        // validate current guess
        if (currentGuess.length !== WORD_LENGTH) {
          alert(`Guess must be ${WORD_LENGTH} letters long.`);
          return;
        }

        // check if word is in dictionary (using cached result)
        const interval = setInterval(() => {
          if(validGuess.current === -1) return; // still checking

          if (validGuess.current === 1) {
            submitGuess();
          } else if (validGuess.current === 0) {
            alert('Not a valid word.');
          }
          clearInterval(interval);
        }, 100);

      } else if (key === 'Backspace') {
        // remove last letter
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(key)) {
        // add letter to current guess
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(currentGuess + key.toLowerCase());

          // if last letter was just entered, check validity here to avoid delays on hitting Enter

          // abort any ongoing validation
          if(validGuessAbortController.current) validGuessAbortController.current.abort();

          const abortController = new AbortController();
          validGuessAbortController.current = abortController;


          validGuess.current = -1; // -1 indicates validation in progress
          if (currentGuess.length + 1 === WORD_LENGTH) {
            console.log('Validating word:', currentGuess + key.toLowerCase());

            const word = currentGuess + key.toLowerCase();
            validateWord(word, abortController.signal)
              .then(isValid => {
                validGuess.current = isValid ? 1 : 0;
              })
              .catch(() => {return;}); // ignore abort errors
          }
        }
      }
    }

    
    if(!gameOver) window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  
  }, [currentGuess, guesses, solution, gameOver]);
  

  return (
    <div>
      <h1>Wordle</h1>
      <p>Guess the 5-letter word!</p>

      <div>
        {/* past guesses: */}
        {guesses.map((guess, index) => (
          <Guess key={index} guess={guess} solution={solution} type='past' />
        ))}

        {/* current guess: */}
        {guesses.length < MAX_GUESSES && (
          <Guess guess={currentGuess} solution={solution} type={gameOver ? 'past' : 'current'}/>
        )}

        {/* unused (future) guesses */}
        {Array.from({length: MAX_GUESSES - guesses.length - 1}).map((_, index) => (
          <Guess key={index + guesses.length + 1} guess="" solution={solution} type='future' />
        ))}

      </div>
        

    </div>
  )
}

export default App
