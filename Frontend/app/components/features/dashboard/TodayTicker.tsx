const ITEMS = [
  'LINKED HISTORY',
  'USEFUL REFLECTION',
  'LEARNING IN CONTEXT',
  'SMALL ACTIONS',
];

export default function TodayTicker() {
  return (
    <div
      className="today-strip"
      role="region"
      aria-label="Small actions build connected history"
    >
      <p className="sr-only">
        Linked history. Useful reflection. Learning in context. Small actions.
      </p>
      <div className="today-strip__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="today-strip__group" key={copy}>
            {ITEMS.map((item) => (
              <span className="today-strip__item" key={item}>
                {item}
                <b>+</b>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
