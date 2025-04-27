import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Get user with id ${req.params.id}` });
});

router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'User created', data: req.body });
});

export default router;