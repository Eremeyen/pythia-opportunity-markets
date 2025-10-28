import { Router } from 'express';
import { createPricePoint, getPriceHistory } from '../controllers/priceController';

const router = Router();

router.post('/', createPricePoint);
router.get('/', getPriceHistory);

export default router;
