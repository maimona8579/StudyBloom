// js/quotes.js – Daily motivational quote widget
// Pure logic only; no DOM access. Page scripts call quoteForDay() and renderQuote().

(function () {
  const QUOTES = [
    "Small steps every day lead to big results.",
    "Focus on progress, not perfection.",
    "A goal without a plan is just a wish.",
    "Every expert was once a beginner.",
    "Discipline is choosing between what you want now and what you want most.",
    "Learning is not attained by chance; it must be sought with ardor.",
    "The secret of getting ahead is getting started.",
    "You don't have to be great to start, but you have to start to be great.",
    "It always seems impossible until it's done.",
    "Believe you can and you're halfway there.",
    "Push yourself, because no one else is going to do it for you.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Dream it. Wish it. Do it.",
    "Don't watch the clock; do what it does. Keep going.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Great things never come from comfort zones.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't stop when you're tired. Stop when you're done.",
    "Study hard. Dream big. Never give up.",
    "You are capable of more than you know.",
    "Education is the passport to the future.",
    "The beautiful thing about learning is that no one can take it away from you.",
  ];

  /** Return a deterministic quote index for today (rotates daily). */
  function quoteForDay() {
    const d = new Date();
    const dayIndex = Math.floor(d.getTime() / 86400000); // days since epoch
    return QUOTES[dayIndex % QUOTES.length];
  }

  /** Return a random quote different from the current one. */
  function randomQuote(current) {
    let q;
    do { q = QUOTES[Math.floor(Math.random() * QUOTES.length)]; } while (q === current && QUOTES.length > 1);
    return q;
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.quotes = { quoteForDay, randomQuote, all: QUOTES };
})();
