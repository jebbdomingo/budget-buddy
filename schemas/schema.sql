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
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Retirement', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Grocery', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Medical', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Rent/Mortgage', DATE('now'), DATE('now'));
INSERT INTO budgets (title, date_created, date_modified) VALUES ('Transportation/Fuel', DATE('now'), DATE('now'));

-- Budget allocations table

DROP TABLE IF EXISTS budget_allocations;
CREATE TABLE IF NOT EXISTS budget_allocations (
  budget_allocation_id integer PRIMARY KEY AUTOINCREMENT,
  budget_month text NOT NULL,
  transaction_date date,
  date_created date,
  date_modified date
);

DROP TABLE IF EXISTS allocations;
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id integer PRIMARY KEY AUTOINCREMENT,
  budget_allocation_id integer,
  budget_id integer,
  debit decimal(10, 2) DEFAULT 0 NOT NULL,
  credit decimal(10, 2) DEFAULT 0 NOT NULL,
  date_created date,
  date_modified date,
  FOREIGN KEY(budget_allocation_id) REFERENCES budget_allocations(budget_allocation_id),
  FOREIGN KEY(budget_id) REFERENCES budgets(budget_id)
);

INSERT INTO budget_allocations (budget_month, transaction_date, date_created) VALUES ('1-2024', '1/2/2024', DATE('now'));
INSERT INTO allocations (budget_allocation_id, budget_id, debit, date_created) VALUES (1, 5, 5000, DATE('now'));
INSERT INTO allocations (budget_allocation_id, budget_id, credit, date_created) VALUES (1, 1, 5000, DATE('now'));

INSERT INTO budget_allocations (budget_month, transaction_date, date_created) VALUES ('1-2024', '1/5/2024', DATE('now'));
INSERT INTO allocations (budget_allocation_id, budget_id, debit, date_created) VALUES (2, 3, 1000, DATE('now'));
INSERT INTO allocations (budget_allocation_id, budget_id, debit, date_created) VALUES (2, 7, 1000, DATE('now'));
INSERT INTO allocations (budget_allocation_id, budget_id, credit, date_created) VALUES (2, 1, 2000, DATE('now'));

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
  debit decimal(10, 2) DEFAULT 0 NOT NULL,
  credit decimal(10, 2) DEFAULT 0 NOT NULL,
  budget_month text NOT NULL,
  payee text NULL,
  memo text NULL,
  archived integer DEFAULT 0 NOT NULL,
  transaction_date date,
  date_created date,
  date_modified date,
  date_archived date,
  FOREIGN KEY(budget_id) REFERENCES budgets(budget_id),
  FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

INSERT INTO transactions (budget_id, account_id, debit, budget_month, date_created, transaction_date) VALUES (1, 2, 10000, '1-2024', DATE('now'), '1/2/2024');
INSERT INTO transactions (budget_id, account_id, debit, budget_month, date_created, transaction_date) VALUES (4, 2, 5000, '1-2024', DATE('now'), '1/2/2024');
INSERT INTO transactions (budget_id, account_id, credit, budget_month, date_created, transaction_date) VALUES (5, 2, 2000, '2-2024', DATE('now'), '2/15/2024');
INSERT INTO transactions (budget_id, account_id, debit, budget_month, date_created, transaction_date) VALUES (1, 2, 10000, '3-2024', DATE('now'), '3/3/2024');

PRAGMA defer_foreign_keys = off;