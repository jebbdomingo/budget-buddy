import { Budget, Account, BudgetBalance, TransactionModelInterface, AccountModelInterface, BudgetModelInterface, Transaction } from './repository'

export class BudgetModel implements BudgetModelInterface {
    constructor(private db: D1Database) {}

    async findAll(): Promise<Budget[]> {
        let result: Budget[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT * FROM budgets WHERE archived = 0
            `)
                .all<Budget>()
    
            result = results
        } catch (e) {
            console.log(e)
        }

        return result
    }

    async find(id: number): Promise<Budget | null> {
        const result = await this.db.prepare(`
            SELECT * FROM budgets WHERE budget_id = ?
        `)
            .bind(id)
            .first<Budget>()

        return result
    }
    
    async create(budget: Budget): Promise<Budget | false> {
        const now = new Date().toISOString()

        const { success, meta } = await this.db.prepare(`
            INSERT INTO budgets (title, date_created, date_modified) VALUES (?, ?, ?)
        `)
            .bind(budget.title, now, now)
            .run()

        if (success) {
            budget.budget_id = meta.last_row_id
            return budget
        } else {
            return false
        }
    }

    async update(budget: Budget): Promise<Budget | false> {
        const now = new Date().toISOString()

        const { success, meta } = await this.db.prepare(`
            UPDATE budgets SET title = ?, date_modified = ? WHERE budget_id = ?
        `)
            .bind(budget.title, now, budget.budget_id)
            .run()

        if (success) {
            budget.budget_id = meta.last_row_id
            return budget
        } else {
            return false
        }
    }

    async archive(id: number): Promise<boolean> {
        let result

        try {
            const now = new Date().toISOString()
    
            const { success } = await this.db.prepare(`
                UPDATE budgets SET archived = ?, date_archived = ? WHERE budget_id = ?
            `)
                .bind(1, now, id)
                .run()

            result = success
        } catch (e) {
            console.error(e)
        }

        if (result) {
            return result
        } else {
            return false
        }
    }

    /**
     * Get the budgets with balances
     * 
     * @returns array
     */
    async fetchBudgetsBalances(): Promise<BudgetBalance[]> {
        let result: BudgetBalance[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT 
                    transaction_id,
                    budget_id,
                    budget_month,
                    SUM(debit) AS assigned,
                    SUM(SUM(debit - credit)) OVER (PARTITION BY budget_id ORDER BY budget_month) AS available
                FROM
                    transactions
                GROUP BY budget_month, budget_id ORDER BY budget_id
            `).all<BudgetBalance>()

            result = results
        } catch (e) {
            console.log(e)
        }

        return result
    }
}

export class AccountModel implements AccountModelInterface {
    constructor(private db: D1Database) {}

    async create(account: Account): Promise<Account | false> {
        const now = new Date().toISOString()

        const { success, meta } = await this.db.prepare(`
            INSERT INTO accounts (title, date_created, date_modified) VALUES (?, ?, ?)
        `)
            .bind(account.title, now, now)
            .run()

        if (success) {
            account.account_id = meta.last_row_id
            return account
        } else {
            return false
        }
    }
    
    async archive(id: number): Promise<boolean> {
        let result

        try {
            const now = new Date().toISOString()
    
            const { success } = await this.db.prepare(`
                UPDATE accounts SET archived = ?, date_archived = ? WHERE account_id = ?
            `)
                .bind(1, now, id)
                .run()

            result = success
        } catch (e) {
            console.error(e)
        }

        if (result) {
            return result
        } else {
            return false
        }
    }
    
    async update(account: Account): Promise<boolean> {
        const now = new Date().toISOString()
        
        let result

        try {
            const { success } = await this.db.prepare(`
                UPDATE accounts SET title = ?, date_modified = ? WHERE account_id = ?
            `)
                .bind(account.title, now, account.account_id)
                .run()
    
            result = success
        } catch (e) {
            console.error(e)
        }

        if (result) {
            return result
        } else {
            return false
        }
    }

    async findAll(): Promise<Account[]> {
        let result: Account[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT * FROM accounts WHERE archived = 0
            `)
                .all<Account>()
    
            result = results
        } catch (e) {
            console.log(e)
        }

        return result
    }
    
    async fetchAccountBalances(): Promise<Account[]> {
        let result: Account[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT 
                    a.account_id,
                    a.title,
                    SUM(SUM(t.debit - t.credit)) OVER (PARTITION BY t.account_id ORDER BY t.transaction_id) AS balance
                FROM
                    accounts AS a 
                LEFT JOIN
                    transactions AS t ON a.account_id = t.account_id
                WHERE a.archived = 0
                GROUP BY a.account_id
                ORDER BY a.title ASC
            `)
                .all<Account>()
    
            result = results
        } catch (e) {
            console.log(e)
        }

        return result
    }
}

export class SnapshotModel implements Model {
    constructor(private db: D1Database) {}

    // async findAll(): Promise<Snapshot[]> {
    //     let result: Snapshot[] = [];

    //     try {
    //         const { results } = await this.db.prepare(`
    //             SELECT s.*, b.title FROM snapshots AS s
    //                 INNER JOIN budgets AS b ON s.budget_id = b.budget_id
    //         `)
    //             .all<Snapshot>()
    
    //         result = results
    //     } catch (e) {
    //         console.log(e)
    //     }

    //     return result
    // }
    
    // async findBy(budget_month): Promise<Snapshot[]> {
    //     let result: Snapshot[] = [];

    //     try {
    //         const { results } = await this.db.prepare(`
    //             SELECT s.*, b.title FROM snapshots AS s
    //                 INNER JOIN budgets AS b ON s.budget_id = b.budget_id
    //             WHERE s.budget_month = ?
    //         `)
    //             .bind(budget_month)
    //             .all<Snapshot>()
    
    //         result = results
    //     } catch (e) {
    //         console.log(e)
    //     }

    //     return result
    // }
    
    /**
     * Generate snapshots for each budget
     * empty budget on specific month will default to the last running balance (`available`)
     * @param budget_month 
     * @returns 
     */
    // async generateBudgetSnapshots(): Promise<any[]> {
    //     let result: any[] = []

    //     const budgetModel = new BudgetModel(this.db)
    //     const budgets = await budgetModel.findAll()
    //     const snapshots = await this.findAll()
        
    //     const dates = ['1-2024','2-2024','3-2024','4-2024','5-2024','6-2024','7-2024']

    //     // Fetch all transaction endings for each budget
    //     const endings = {}
    //     snapshots.forEach(data => {
    //         endings[data.title] = {
    //             budget_month: data.budget_month,
    //             assigned: data.assigned,
    //             available: data.available
    //         }
    //     });

    //     // Build the budget snapshots data structure
    //     const data = {}
    //     dates.forEach(month => {
    //         let oBudgets = {}

    //         budgets.forEach(budget => {
    //             let snaps = {}

    //             snapshots.forEach(snapshot => {
    //                 if (budget.budget_id == snapshot.budget_id && month == snapshot.budget_month) {
    //                     snaps = {
    //                         assigned: snapshot.assigned,
    //                         available: snapshot.available
    //                     }
    //                 }
    //             })
                
    //             if (Object.keys(snaps).length) {
    //                 oBudgets[budget.title] = snaps
    //             } else {
    //                 if (endings[budget.title]) {
    //                     oBudgets[budget.title] = endings[budget.title]
    //                 } else {
    //                     oBudgets[budget.title] = {}
    //                 }
    //             }
    //         })
            
    //         data[month] = oBudgets
    //     })

    //     result = data

    //     return result
    // }
}

export class TransactionModel implements TransactionModelInterface {
    constructor(private db: D1Database) {}

    async find(id: number): Promise<Transaction | null> {
        const result = await this.db.prepare(`
            SELECT t.*, b.title AS budget_title
            FROM transactions AS t
            LEFT JOIN budgets AS b ON b.budget_id = t.budget_id
            WHERE t.transaction_id = ?
        `)
            .bind(id)
            .first<Transaction>()

        return result
    }
    
    async findBy(filter: { id: number, budget_id: number, account_id: number }): Promise<Transaction[]> {
        try {
            let stmt

            if (filter.id) {
                stmt = this.db.prepare(`
                    SELECT * FROM transactions WHERE transaction_id = ?
                `).bind(filter.id)
            }
            
            if (filter.budget_id) {
                stmt = this.db.prepare(`
                    SELECT * FROM transactions WHERE budget_id = ?
                `).bind(filter.budget_id)
            }
            
            if (filter.account_id) {
                stmt = this.db.prepare(`
                    SELECT t.*, b.title AS budget_title FROM transactions AS t
                    LEFT JOIN budgets AS b ON b.budget_id = t.budget_id
                    WHERE t.account_id = ?
                    ORDER BY t.transaction_date DESC
                `).bind(filter.account_id)
            }

            const { results } = await stmt.all<Transaction>()
            return results
        } catch (e) {
            console.log(e)
        }
    }
    
    /**
     * Create a budget allocation
     * allocation creates fresh budget snapshots
     * 
     * @param Transaction transaction
     * @returns Transaction|boolean
     */
    async createBudgetAllocation(transaction: Transaction): Promise<Transaction | boolean> {
        const date = new Date()
        const now = date.toISOString()
        let stmt

        try {
            // Create new transaction
            if (transaction.transaction_type == 'Outflow') {
                stmt = this.db.prepare(`
                    INSERT INTO transactions (budget_id, account_id, payee, debit, credit, budget_month, transaction_date, date_created, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(transaction.budget_id, transaction.account_id, transaction.payee, 0, transaction.amount, transaction.budget_month, transaction.transaction_date, now, transaction.memo)
            } else {
                stmt = this.db.prepare(`
                    INSERT INTO transactions (budget_id, account_id, payee, debit, credit, budget_month, transaction_date, date_created, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(transaction.budget_id, transaction.account_id, transaction.payee, transaction.amount, 0, transaction.budget_month, transaction.transaction_date, now, transaction.memo)
            }

            const { success, meta } = await stmt.run()

            if (success) {
                transaction.transaction_id = meta.last_row_id
                return transaction
            } else {
                return false
            }
        } catch (e) {
            console.log(e)
        }

        return false
    }
}

// export class AllocationModel implements Model {
//     constructor(private db: D1Database) {}
    
//     async create(allocation: BudgetAllocation): Promise<BudgetAllocation | false> {
//         const now = new Date().toISOString()

//         const { success, meta } = await this.db.prepare(`
//             INSERT INTO budget_allocations (budget_id, amount, date_budgeted, month_allocation) VALUES (?, ?, ?, ?)
//         `)
//             .bind(allocation.budget_id, allocation.amount, now, allocation.month_allocation)
//             .run()

//         if (success) {
//             allocation.budget_allocation_id = meta.last_row_id
//             return allocation
//         } else {
//             return false
//         }
//     }
// }

// export const getBudgets = async (D1: D1Database): Promise<Budget[]> => {
//     const { results } = await D1.prepare(`
//         SELECT * FROM budgets
//     `)
//         .all<Budget>()

//     // const rows = results.map(budget => {
//     //     console.log(budget)
//     // })

//     return results
// }