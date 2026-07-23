/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // cost_price on products
  pgm.addColumn("products", {
    cost_price: {
      type: "decimal(10, 2)",
      notNull: true,
      default: 0,
    },
  }, { ifNotExists: true });

  // customer_id on orders (nullable, no FK — keeps checkout working)
  pgm.addColumn("orders", {
    customer_id: {
      type: "integer",
    },
  }, { ifNotExists: true });

  // customers + debts tables (referenced by customerController)
  pgm.createTable("customers", {
    id: { type: "serial", primaryKey: true },
    name: { type: "varchar(200)", notNull: true },
    phone: { type: "varchar(50)" },
    created_at: { type: "timestamp with time zone", default: pgm.func("CURRENT_TIMESTAMP") },
  }, { ifNotExists: true });

  pgm.createTable("debts", {
    id: { type: "serial", primaryKey: true },
    customer_id: { type: "integer", notNull: true, references: "customers(id)", onDelete: "CASCADE" },
    order_id: { type: "integer", references: "orders(id)", onDelete: "SET NULL" },
    amount: { type: "decimal(10, 2)", notNull: true },
    paid: { type: "boolean", notNull: true, default: false },
    paid_date: { type: "timestamp with time zone" },
    created_at: { type: "timestamp with time zone", default: pgm.func("CURRENT_TIMESTAMP") },
  }, { ifNotExists: true });
};

export const down = (pgm) => {
  pgm.dropTable("debts", { ifExists: true });
  pgm.dropTable("customers", { ifExists: true });
  pgm.dropColumn("orders", "customer_id", { ifExists: true });
  pgm.dropColumn("products", "cost_price", { ifExists: true });
};
