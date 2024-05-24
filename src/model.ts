import { Budget, Account, BudgetBalance, TransactionModelInterface, AccountModelInterface, BudgetModelInterface } from './repository'

export class BudgetModel implements BudgetModelInterface {
    constructor(private db: D1Database) {}

    async findAll(): Promise<Budget[]> {
        let result: Budget[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT * FROM budgets
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

    async findAll(): Promise<Account[]> {
        let result: Account[] = []

        try {
            const { results } = await this.db.prepare(`
                SELECT * FROM accounts
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
                    a.title,
                    t.debit,
                    t.credit,
                    SUM(SUM(t.debit - t.credit)) OVER (PARTITION BY t.account_id ORDER BY t.transaction_id) AS balance
                FROM
                    transactions AS t
                LEFT JOIN
                    accounts AS a ON a.account_id = t.account_id
                GROUP BY t.account_id
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
    
    /**
     * Create a budget allocation
     * allocation creates fresh budget snapshots
     * 
     * @param budget_id 
     * @param account_id 
     * @param amount 
     * @param budget_month 
     * @returns boolean
     */
    async createBudgetAllocation(budget_id: number, account_id: number, amount: number, budget_month: string): Promise<number | boolean> {
        const date = new Date()
        const now = date.toISOString()

        try {
            // Create new transaction
            const { success } = await this.db.prepare(`
                INSERT INTO transactions (budget_id, account_id, debit, credit, budget_month, date_created) VALUES (?, ?, ?, ?, ?, ?)
            `)
                .bind(budget_id, account_id, amount, '0', budget_month, now)
                .run()

            return success
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