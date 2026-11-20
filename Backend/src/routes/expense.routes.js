import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateObjectIdParam } from '../middlewares/validateObjectId.middleware.js';
import {
  createExpenseSchema,
  createExpensesSchema,
  expenseQuerySchema,
  updateExpenseSchema,
} from '../validators/expense.validator.js';
import {
  createExpense,
  createExpenses,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '../controllers/expense.controller.js';

const router = Router();

router.use(verifyJWT);
router.param('id', validateObjectIdParam);

router.post('/bulk', validate(createExpensesSchema), createExpenses);

router
  .route('/')
  .get(validate(expenseQuerySchema, 'query'), getExpenses)
  .post(validate(createExpenseSchema), createExpense);

router
  .route('/:id')
  .patch(validate(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

export default router;
