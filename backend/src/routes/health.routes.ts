import { Router } from 'express';
import { HEALTH_ENDPOINTS } from '@server/constants/api';

const router = Router();

router.get(HEALTH_ENDPOINTS.GENERAL.path, async (_, res) => {
  res.json({ message: 'health is ok' });
});

router.get(HEALTH_ENDPOINTS.DUMMY.path, async (_, res) => {
  res.json({ message: 'success' });
});

router.post(HEALTH_ENDPOINTS.DUMMY_POST.path, async (req, res) => {
  res.json({ message: 'success', body: req.body });
});

export default router;
