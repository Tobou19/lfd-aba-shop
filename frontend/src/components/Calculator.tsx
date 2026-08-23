import { useState } from 'react';

const buttonStyle = (backgroundColor?: string, colSpan?: number) => ({
  padding: '16px',
  fontSize: '18px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: backgroundColor || 'var(--background-color)',
  color: 'var(--text-color)',
  gridColumn: colSpan || 1,
  transition: 'background-color 0.2s',
});

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    setOperation(op);
    setPreviousValue(parseFloat(display));
    setNewNumber(true);
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      let result = 0;

      switch (operation) {
        case '+':
          result = previousValue + current;
          break;
        case '-':
          result = previousValue - current;
          break;
        case '×':
          result = previousValue * current;
          break;
        case '÷':
          result = previousValue / current;
          break;
        default:
          return;
      }

      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay((current / 100).toString());
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        backgroundColor: 'var(--background-color)',
        padding: '16px',
        textAlign: 'right',
        fontSize: '24px',
        marginBottom: '12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {display}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <button onClick={handleClear} style={buttonStyle('#f44336')}>C</button>
        <button onClick={handleBackspace} style={buttonStyle('#FF9800')}>⌫</button>
        <button onClick={handlePercent} style={buttonStyle('#2196F3')}>%</button>
        <button onClick={() => handleOperation('÷')} style={buttonStyle('#FF9800')}>÷</button>

        {[7, 8, 9].map(num => (
          <button key={num} onClick={() => handleNumber(num.toString())} style={buttonStyle()}>
            {num}
          </button>
        ))}
        <button onClick={() => handleOperation('×')} style={buttonStyle('#FF9800')}>×</button>

        {[4, 5, 6].map(num => (
          <button key={num} onClick={() => handleNumber(num.toString())} style={buttonStyle()}>
            {num}
          </button>
        ))}
        <button onClick={() => handleOperation('-')} style={buttonStyle('#FF9800')}>-</button>

        {[1, 2, 3].map(num => (
          <button key={num} onClick={() => handleNumber(num.toString())} style={buttonStyle()}>
            {num}
          </button>
        ))}
        <button onClick={handleEquals} style={buttonStyle('#4CAF50', 2)}>+</button>

        <button onClick={() => handleNumber('0')} style={buttonStyle(undefined, 2)}>0</button>
        <button onClick={handleDecimal} style={buttonStyle()}>,</button>
      </div>
    </div>
  );
};