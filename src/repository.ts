export type Budget = {
	budget_id: number
	title: string
	balance: number
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

export interface Model {
    findAll(): Promise<Budget[] | Transaction[] | Snapshot[]>
    findBy(): Promise<Budget[] | Transaction[] | Snapshot[]>
    find(id: any): Promise<any | null>
    create(entity: any): Promise<any | false>
    createBudgetAllocation(budget_id: number, account_id: number, amount: number, budget_month: string): Promise<number | boolean>
}

export class Repository {
    constructor(private model: Model) {}

    public getBudgets(): Promise<Budget[]> {
        return this.model.findAll();
    }
    
    public getBudget(id: number): Promise<Budget | null> {
        return this.model.find(id);
    }
    
    public createBudget(budget: Budget): Promise<Budget | false> {
        return this.model.create(budget);
    }
    
    public fundAllocation(budget_id: number, account_id: number, amount: number, budget_month: string): Promise<boolean> {
        return this.model.createBudgetAllocation(budget_id, account_id, amount, budget_month);
    }

    public getSnapshotsBy(budget_month: string): Promise<Snapshot[]> {
        return this.model.findBy(budget_month);
    }
}