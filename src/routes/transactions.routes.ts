import { getCustomRepository } from 'typeorm';
import { Router } from 'express';
import multer from 'multer';

import ImportTransactionsService from '../services/ImportTransactionsService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find({relations: ['category']});

  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionRepository = getCustomRepository(TransactionsRepository);

  await transactionRepository.delete(id);

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const uploadData = new ImportTransactionsService();

    const transactions = await uploadData.execute({
      dataFilename: request.file.filename,
    });

    console.log(transactions);

    return response.json(transactions);
  },
);

export default transactionsRouter;
