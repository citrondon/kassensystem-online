/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    username: { type: "varchar(100)", notNull: true, unique: true },
    password_hash: { type: "varchar(255)", notNull: true },
    role: { type: "varchar(50)", notNull: true, default: "cashier" },
    created_at: { type: "timestamp with time zone", default: pgm.func("CURRENT_TIMESTAMP") },
  });

  // Demo users are created via npm run seed after deployment.
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("users", { ifExists: true, cascade: true });
};
