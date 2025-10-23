export default function Guess({guess, solution, type}: {guess: string, solution: string, type: 'past' | 'current' | 'future'}) {  
  return (
    <div className={`guess-row ${type}`}>
      {guess.padEnd(5, ' ').split('').map((letter, index) => (
        <span key={index} className={'guess-char ' + 
          (type=='past' ? solution.includes(letter) ?
            (solution[index] === letter ? 'correct' : 'present')
            : 'absent'
          : '')
        }>
          {letter}
        </span>
      ))}
    </div>
  );
}