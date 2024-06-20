PRAGMA defer_foreign_keys = on;

-- Budgets table

DROP TABLE IF EXISTS budgets;
CREATE TABLE IF NOT EXISTS budgets (
  budget_id integer PRIMARY KEY AUTOINCREMENT,
  title text NOT NULL,
  archived integer DEFAULT 0 NOT NULL,
  date_created date,
  date_modified date,
  date_archived date
);
CREATE INDEX idx_budgets_title ON budgets (title);

INSERT INTO budgets (title, date_created, date_modified) VALUES ('Ready to Assign', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Savings', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Emergency Fund', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Stewardship', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Welfare Fund', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Medical', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Retirement', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Grocery', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Rent/Mortgage', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Transportation/Fuel', DATE('now'), DATE('now'));

-- Accounts table

DROP TABLE IF EXISTS accounts;
CREATE TABLE IF NOT EXISTS accounts (
  account_id integer PRIMARY KEY AUTOINCREMENT,
  title text NOT NULL,
  archived integer DEFAULT 0 NOT NULL,
  date_created date,
  date_modified date,
  date_archived date
);
CREATE INDEX idx_accounts_title ON accounts (title);

INSERT INTO accounts (title, date_created, date_modified) VALUES ('Cash on hand', DATE('now'), DATE('now'));
INSERT INTO accounts (title, date_created, date_modified) VALUES ('Cash in bank', DATE('now'), DATE('now'));

-- Transactions table

DROP TABLE IF EXISTS transactions;
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id integer PRIMARY KEY AUTOINCREMENT,
  budget_id integer,
  account_id integer,
  debit decimal(10, 2) NOT NULL,
  credit decimal(10, 2) NOT NULL,
  budget_month text NOT NULL,
  payee text NULL,
  memo text NULL,
  date_created date,
  date_modified date,
  FOREIGN KEY(budget_id) REFERENCES budgets(budget_id),
  FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 500, 0, '1-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 500, 0, '1-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 0, 200, '1-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 200, 0, '2-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 800, 0, '3-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 200, 0, '4-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (2, 1, 100, 0, '6-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (3, 1, 0, 400, '1-2024', DATE('now'));
INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (3, 1, 100, 0, '2-2024', DATE('now'));


-- Budget snapshots table

DROP TABLE IF EXISTS snapshots;
CREATE TABLE IF NOT EXISTS snapshots (
  snapshot_id integer PRIMARY KEY AUTOINCREMENT,
  budget_id integer,
  budget_month text NOT NULL,
  assigned decimal(10, 2) NOT NULL,
  available decimal(10, 2) NOT NULL,
  date_created date,
  date_modified date
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshots_budget_id ON snapshots(budget_id, budget_month);

-- INSERT INTO snapshots (budget_id, account_id, budget_month, assigned, available, date_created, date_modified) VALUES (2, 2, '4/2024', 1000, 900, DATE('now'), DATE('now'));

PRAGMA defer_foreign_keys = off;