/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AccountModel, BudgetModel, SnapshotModel, TransactionModel } from './model'
import { Repository, Budget, Account } from './repository'
import { Env } from './bindings'

const app = new Hono<{ Bindings: Env }>()
app.use('/api/*', cors())

app.get('/', c => {
	return c.json({ hello: 'world'} )
})

app.get('api/budgets', async c => {
	try {
		const repo = new Repository(new BudgetModel(c.env.DB))
		const budgets = await repo.getBudgets()
		
		return c.json({ budgets: budgets, ok: true })
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.get('api/budgets/:id', async c => {
	try {
		const id: any = c.req.param('id') 
		const repo = new Repository(new BudgetModel(c.env.DB))
		const budget = await repo.getBudget(id);

		if (!budget) {
			return c.json({ ok: false, error: 'Not Found'}, 404)
		}
		
		return c.json({ ok: true, budget: budget })
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.post('api/budgets', async c => {	
	const { title } = await c.req.json()

	if (!title) return c.text("Missing title for new budget")

	try {
		const budget: Budget = {
			budget_id: 0,
			title: title
		}
		
		const repo = new Repository(new BudgetModel(c.env.DB))
		const result = await repo.createBudget(budget)

		if (!result) {
			return c.json({ ok: false, error: "Something went wrong" }, 422)
		}
		
		return c.json({ ok: true, budget: result }, 201)
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.get('api/accounts', async c => {
	try {
		const repo = new Repository(new AccountModel(c.env.DB))
		const accounts = await repo.getAccounts()
		
		return c.json({ accounts: accounts, ok: true })
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.post('api/fund_allocation', async c => {	
	const { budget_id, account_id, amount, budget_month } = await c.req.json()

	try {		
		const repo = new Repository(new TransactionModel(c.env.DB))
		const result = await repo.fundAllocation(budget_id, account_id, amount, budget_month)

		if (!result) {
			return c.json({ ok: false, error: "Something went wrong" }, 422)
		}
		
		return c.json({ ok: true, transaction: result }, 201)
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.get('api/snapshots/month/:budget_month', async c => {
	const budget_month: string = c.req.param('budget_month') 

	try {
		const repo = new Repository(new SnapshotModel(c.env.DB))
		const snapshots = await repo.getSnapshotsBy(budget_month)
		
		return c.json({ snapshots: snapshots, ok: true })
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

app.get('api/snapshots/generate', async c => {
	// const budget_month: string = c.req.param('budget_month') 

	try {
		const repo = new Repository(new SnapshotModel(c.env.DB))
		const result = await repo.generateBudgetSnapshots()
		
		return c.json({ result: result, ok: true })
	} catch (e) {
		return c.json({err: e}, 500)
	}
})

// app.post('api/budget_allocations', async c => {	
// 	const { budget_id, amount, month_allocation } = await c.req.json()

// 	if (!amount) return c.text("Missing amount for new budget allocation")

// 	try {
// 		const allocation: BudgetAllocation = {
// 			budget_id: budget_id,
// 			amount: amount,
// 			month_allocation: month_allocation
// 		}

// 		const repo = new Repository(new AllocationModel(c.env.DB))
// 		const result = await repo.createBudgetAllocation(allocation)

// 		if (!result) {
// 			return c.json({ ok: false, error: "Something went wrong" }, 422)
// 		}
		
// 		return c.json({ ok: true, budget_allocation: result }, 201)
// 	} catch (e) {
// 		console.log(e)
// 		return c.json({err: e}, 500)
// 	}
// })

export default app

// export default {
// 	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
// 		return new Response('Hello World!');
// 	},
// };
