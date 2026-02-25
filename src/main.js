import './style.css';
import { initSpiki, setExpression, isMopping } from './spiki.js';
import { initInteractions } from './interactions.js';
import { initMood } from './mood.js';

// Initialize Spiki character
initSpiki();

// Initialize mood system with expression callback
let lastExpression = 'happy';
initMood((expression, happiness) => {
  if (expression !== lastExpression) {
    if (!isMopping()) {
      setExpression(expression);
    }
    lastExpression = expression;
  }
});

// Initialize click/interaction handlers
initInteractions();
