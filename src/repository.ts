export type Budget = {
	budget_id: number
	title: string
	date_created: Date
	date_modified: Date
}

export type BudgetBalance = {
	budget_id: number
	budget_month: string,
    assigned: number
    available: number
}

export type Account = {
	account_id: number
	title: string
	date_created: Date
	date_modified: Date
}

export type Snapshot = {
    snapshot_id: number
	budget_id: number
	budget_month: string
	assigned: number
	available: number
	date_created: Date
	date_modified: Date
}

export type Transaction = {
	budget_id: number
	account_id: number
	debit: number
	credit: number
	date_created: Date
}

export interface BaseModelInterface {
    findAll(): Promise<any[]>
    findBy(): Promise<any[] | null>
    find(id: any): Promise<any | null>
    create(entity: any): Promise<any | false>
    update(entity: any): Promise<any | false>
}

export interface BudgetModelInterface extends BaseModelInterface {
    findAll(): Promise<Budget[]>
    find(id: any): Promise<Budget | null>
    fetchBudgetsBalances(): Promise<BudgetBalance[]>
}

export interface AccountModelInterface extends BaseModelInterface {
    findAll(): Promise<Account[]>
    findBy(): Promise<Account[] | null>
    find(id: any): Promise<Account | null>
    create(entity: any): Promise<Account | false>
    update(entity: any): Promise<Account | false>
}

export interface TransactionModelInterface extends BaseModelInterface {
    createBudgetAllocation(budget_id: number, account_id: number, amount: number, budget_month: string): Promise<number | boolean>
}

export class Repository {
    constructor(private model: Model) {}

    public getBudgets(): Promise<Budget[]> {
        return this.model.findAll();
    }
    
    public getBudgetsBalances(): Promise<BudgetBalance[]> {
        return this.model.fetchBudgetsBalances();
    }
    
    public getBudget(id: number): Promise<Budget | null> {
        return this.model.find(id);
    }
    
    public createBudget(budget: Budget): Promise<Budget | false> {
        return this.model.create(budget);
    }
    
    public createAccount(account: Account): Promise<Account | false> {
        return this.model.create(account);
    }
    
    public updateAccount(account: Account): Promise<Account | false> {
        return this.model.update(account);
    }

    public getAccounts(): Promise<Account[]> {
        return this.model.findAll();
    }
    
    public getAccountBalances(): Promise<Account[]> {
        return this.model.fetchAccountBalances();
    }

    public getTransactionsByType(type, id): Promise<Transaction[]> {
        let filter

        if (type == 'transaction') {
            filter = { id: id }
        } else if (type == 'budget') {
            filter = { budget_id: id }
        }  else if (type == 'account') {
            filter = { account_id: id }
        }

        return this.model.findBy(filter);
    }
    
    public fundAllocation(budget_id: number, account_id: number, amount: number, budget_month: string): Promise<boolean> {
        return this.model.createBudgetAllocation(budget_id, account_id, amount, budget_month);
    }

    // public getSnapshots(): Promise<Snapshot[]> {
    //     return this.model.findAll();
    // }
    
    // public getSnapshotsBy(budget_month: string): Promise<Snapshot[]> {
    //     return this.model.findBy(budget_month);
    // }
    
    // public generateBudgetSnapshots(): Promise<any[]> {
    //     return this.model.generateBudgetSnapshots();
    // }
}