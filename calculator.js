'use strict';

const display = document.getElementById('result');
const expression = document.getElementById('expression');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function updateDisplay(value) {
  display.textContent = formatNumber(value);
  const len = display.textContent.length;
  display.classList.toggle('small', len > 9);
  display.classList.toggle('tiny', len > 14);
}

function formatNumber(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  // Avoid scientific notation for reasonable numbers
  if (Math.abs(num) < 1e15 && value.indexOf('e') === -1) {
    // Preserve trailing decimal point and zeros during input
    if (value.endsWith('.') || /\.\d*0$/.test(value)) return value;
    return parseFloat(num.toPrecision(12)).toString();
  }
  return num.toPrecision(10).replace(/\.?0+e/, 'e');
}

function calculate(a, op, b) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case '+':  return x + y;
    case '−':  return x - y;
    case '×':  return x * y;
    case '÷':  return y === 0 ? 'Error' : x / y;
    default:   return y;
  }
}

function handleNumber(value) {
  if (waitingForOperand) {
    currentValue = value;
    waitingForOperand = false;
  } else if (justCalculated) {
    currentValue = value;
    operator = null;
    previousValue = null;
    expression.textContent = '';
    justCalculated = false;
  } else {
    currentValue = currentValue === '0' ? value : currentValue + value;
  }
  updateDisplay(currentValue);
}

function handleDecimal() {
  if (waitingForOperand) {
    currentValue = '0.';
    waitingForOperand = false;
    updateDisplay(currentValue);
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue += '.';
    updateDisplay(currentValue);
  }
}

function handleOperator(op) {
  if (operator && !waitingForOperand) {
    const result = calculate(previousValue, operator, currentValue);
    currentValue = String(result);
    updateDisplay(currentValue);
  }
  previousValue = currentValue;
  operator = op;
  waitingForOperand = true;
  justCalculated = false;

  // Highlight active operator
  document.querySelectorAll('.btn.operator').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === op);
  });

  expression.textContent = `${formatNumber(previousValue)} ${op}`;
}

function handleEquals() {
  if (!operator || !previousValue) return;

  const expr = `${formatNumber(previousValue)} ${operator} ${formatNumber(currentValue)} =`;
  const result = calculate(previousValue, operator, currentValue);
  expression.textContent = expr;
  currentValue = String(result);
  operator = null;
  previousValue = null;
  waitingForOperand = false;
  justCalculated = true;

  document.querySelectorAll('.btn.operator').forEach(b => b.classList.remove('active'));
  updateDisplay(currentValue);
}

function handleClear() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  expression.textContent = '';
  document.querySelectorAll('.btn.operator').forEach(b => b.classList.remove('active'));
  updateDisplay(currentValue);
}

function handleSign() {
  currentValue = String(parseFloat(currentValue) * -1);
  updateDisplay(currentValue);
}

function handlePercent() {
  currentValue = String(parseFloat(currentValue) / 100);
  updateDisplay(currentValue);
}

// Button clicks
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { action, value } = btn.dataset;
    switch (action) {
      case 'number':   handleNumber(value); break;
      case 'decimal':  handleDecimal(); break;
      case 'operator': handleOperator(value); break;
      case 'equals':   handleEquals(); break;
      case 'clear':    handleClear(); break;
      case 'sign':     handleSign(); break;
      case 'percent':  handlePercent(); break;
    }
  });
});

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
  else if (e.key === '.') handleDecimal();
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('−');
  else if (e.key === '*') handleOperator('×');
  else if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') handleEquals();
  else if (e.key === 'Escape') handleClear();
  else if (e.key === 'Backspace') {
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = '0';
    }
    updateDisplay(currentValue);
  }
  else if (e.key === '%') handlePercent();
});

updateDisplay(currentValue);
