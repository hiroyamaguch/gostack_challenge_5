import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const maxCallback2 = (acc: number, cur: number): number => acc + cur;

    const incomeResult = transactions
      .map(el => {
        if (el.type === 'income') {
          return el.value;
        }
        return 0;
      })
      .reduce(maxCallback2, 0);

    const outcomeResult = transactions
      .map(el => {
        if (el.type === 'outcome') {
          return el.value;
        }
        return 0;
      })
      .reduce(maxCallback2, 0);

    const total = incomeResult - outcomeResult;

    return { income: incomeResult, outcome: outcomeResult, total };
  }
}

export default TransactionsRepository;
