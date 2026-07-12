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
  pgm.createTable("categories", {
    id: { type: "serial", primaryKey: true },
    name: { type: "varchar(100)", notNull: true, unique: true },
  }, { ifNotExists: true });

  pgm.createTable("products", {
    id: { type: "serial", primaryKey: true },
    name: { type: "varchar(255)", notNull: true, unique: true },
    barcode: { type: "varchar(50)", unique: true },
    price: { type: "decimal(10, 2)", notNull: true },
    stock: { type: "integer", notNull: true, default: 0 },
    category_id: {
      type: "integer",
      references: "categories(id)",
      onDelete: "SET NULL",
    },
    image_url: { type: "varchar(500)" },
    low_stock_threshold: { type: "integer", notNull: true, default: 10 },
  }, { ifNotExists: true });

  pgm.createTable("orders", {
    id: { type: "serial", primaryKey: true },
    order_date: { type: "timestamp with time zone", default: pgm.func("CURRENT_TIMESTAMP") },
    total_amount: { type: "decimal(10, 2)", notNull: true },
    discount_amount: { type: "decimal(10, 2)", notNull: true, default: 0 },
    payment_method: { type: "varchar(50)", notNull: true, default: "cash" },
    amount_tendered: { type: "decimal(10, 2)", notNull: true, default: 0 },
    change_amount: { type: "decimal(10, 2)", notNull: true, default: 0 },
    status: { type: "varchar(50)", notNull: true, default: "completed" },
  }, { ifNotExists: true });

  pgm.createTable("order_items", {
    id: { type: "serial", primaryKey: true },
    order_id: { type: "integer", notNull: true, references: "orders(id)", onDelete: "CASCADE" },
    product_id: { type: "integer", notNull: true, references: "products(id)", onDelete: "RESTRICT" },
    quantity: { type: "integer", notNull: true },
    unit_price: { type: "decimal(10, 2)", notNull: true },
  }, { ifNotExists: true });

  pgm.createIndex("products", "category_id", { name: "idx_products_category_id", ifNotExists: true });
  pgm.createIndex("order_items", "order_id", { name: "idx_order_items_order_id", ifNotExists: true });
  pgm.createIndex("orders", "order_date", { name: "idx_orders_order_date", ifNotExists: true, desc: true });

  pgm.sql(`
    INSERT INTO categories (name) VALUES
      ('Obst & Gemuese'),
      ('Getraenke'),
      ('Backwaren'),
      ('Suessigkeiten'),
      ('Grundnahrungsmittel')
    ON CONFLICT (name) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO products (name, barcode, price, stock, category_id, low_stock_threshold) VALUES
      ('Apfel',       '4000000012345', 0.49, 150, 1, 20),
      ('Banane',      '4000000067890', 0.29, 80,  1, 20),
      ('Milch 1L',    '4000000023456', 1.39, 40,  5, 10),
      ('Brot',        '4000000034567', 3.49, 20,  3, 10),
      ('Wasser 0.5L', '4000000045678', 0.69, 200, 2, 30),
      ('Schokolade',  '4000000056789', 1.49, 60,  4, 15),
      ('Kaffee 200g', '4000000067891', 5.99, 15,  5, 8),
      ('Eier 10er',   '4000000078901', 3.29, 30,  5, 10)
    ON CONFLICT (name) DO NOTHING;
  `);

  pgm.sql(`
    ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);
    ALTER TABLE products ADD CONSTRAINT products_stock_check CHECK (stock >= 0);
    ALTER TABLE products ADD CONSTRAINT products_low_stock_threshold_check CHECK (low_stock_threshold >= 0);
    ALTER TABLE orders ADD CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0);
    ALTER TABLE orders ADD CONSTRAINT orders_discount_amount_check CHECK (discount_amount >= 0);
    ALTER TABLE orders ADD CONSTRAINT orders_amount_tendered_check CHECK (amount_tendered >= 0);
    ALTER TABLE orders ADD CONSTRAINT orders_change_amount_check CHECK (change_amount >= 0);
    ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("order_items", { ifExists: true, cascade: true });
  pgm.dropTable("orders", { ifExists: true, cascade: true });
  pgm.dropTable("products", { ifExists: true, cascade: true });
  pgm.dropTable("categories", { ifExists: true, cascade: true });
};
