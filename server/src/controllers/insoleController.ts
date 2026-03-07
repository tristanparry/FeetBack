import { Request, Response } from 'express';
import {
  addInsole,
  getInsoleById,
  getInsolesByUser,
  removeInsole,
} from '../services/insoleService.ts';
import { FOOT_KEYS } from '../utils/insoleUtils.ts';

export const pairInsole = async (req: Request, res: Response) => {
  try {
    const insole_id = req.params.id;
    const user_id = req.user?.user_id;
    const { foot } = req.body;
    if (!user_id || !insole_id || !foot || !FOOT_KEYS.includes(foot))
      return res.status(400).json({ error: 'Missing required fields.' });
    await addInsole(user_id, insole_id, foot);
    console.info(
      `Insole paired: user_id=${user_id}, insole_id=${insole_id}, foot=${foot}`,
    );
    res.status(201).json({ message: 'Insole paired.' });
  } catch (e: any) {
    console.error(e);
    if (e.code === '23505') {
      return res
        .status(409)
        .json({ error: 'Insole already paired or foot already used.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getInsole = async (req: Request, res: Response) => {
  try {
    const insole_id = req.params.id;
    const user_id = req.user?.user_id;
    if (!user_id || !insole_id)
      return res.status(400).json({ error: 'User/Insole ID missing.' });
    const insole = await getInsoleById(Number(user_id), insole_id);
    if (!insole) return res.status(404).json({ error: 'Insole not found.' });
    res.json(insole);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getUserInsoles = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(400).json({ error: 'User ID missing.' });
    const insoles = await getInsolesByUser(Number(user_id));
    if (!insoles || insoles.length === 0)
      return res.status(404).json({ error: 'Insoles not found.' });
    res.json(insoles);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const unpairInsole = async (req: Request, res: Response) => {
  try {
    const insole_id = req.params.id;
    const user_id = req.user?.user_id;
    if (!user_id || !insole_id)
      return res.status(400).json({ error: 'User/Insole ID missing.' });
    const removed = await removeInsole(Number(user_id), insole_id);
    if (!removed)
      return res.status(404).json({ error: 'Insole not found/owned by user.' });
    console.info(`Insole unpaired: user_id=${user_id}, insole_id=${insole_id}`);
    res.json({ message: 'Insole unpaired.' });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};
