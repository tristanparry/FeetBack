import { Request, Response } from 'express';
import { generateHealthInsights } from '../services/healthInsightService.ts';

export const getHealthInsights = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const insights = await generateHealthInsights(user_id);
    console.info(
      `Health insights generated: user_id=${user_id}, count=${insights?.length ?? 0}`,
    );
    res.json(insights ?? []);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};
