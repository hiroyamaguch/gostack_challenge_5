// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    /* Verifica se a pessoa tem saldo para registrar a transferência */
    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total - value <= 0) {
      throw new AppError(`You don't have more money!`);
    }

    /* Verifica a existencia de uma categoria no banco */
    const checkExistenceOfCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });

    if (!checkExistenceOfCategory) {
      const newCategory = categoryRepository.create({ title: category });
      const newCategoryWithId = await categoryRepository.save(newCategory);

      transaction.category_id = newCategoryWithId.id;
    } else {
      transaction.category_id = checkExistenceOfCategory.id;
    }

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
