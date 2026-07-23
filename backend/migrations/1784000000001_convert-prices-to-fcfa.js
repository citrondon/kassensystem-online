/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Convert existing product prices from EUR to FCFA (×655.957, rounded)
 */
export const up = (pgm) => {
  pgm.sql(`
    UPDATE products SET
      price = ROUND(price * 655.957),
      cost_price = ROUND(cost_price * 655.957)
    WHERE price < 1000;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    UPDATE products SET
      price = ROUND(price / 655.957, 2),
      cost_price = ROUND(cost_price / 655.957, 2)
    WHERE price > 1000;
  `);
};
