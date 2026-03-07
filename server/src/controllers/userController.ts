import { Request, Response } from 'express';
import {
  generateAccessToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../services/authService.ts';
import {
  getUserById,
  userDeletion,
  userLogin,
  userRegistration,
  userUpdate,
} from '../services/userService.ts';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'REQUIRED' });
    const result = await userRegistration(email, password);
    console.info(`User registered: user_id=${result.user.user_id}`);
    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (e: any) {
    console.error('Error creating user:', e);
    if (e.code === '23505') return res.status(409).json({ error: 'EXISTS' });
    res.status(500).json({ error: 'Server error.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'REQUIRED' });
    const result = await userLogin(email, password);
    if (!result) return res.status(401).json({ error: 'INVALID' });
    console.info(`User logged in: user_id=${result.user.user_id}`);
    res.json({ message: 'Login successful', ...result });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ error: 'Missing refresh token.' });
    const decoded = await verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.user_id, decoded.email);
    console.info(`Access token refreshed: user_id=${decoded.user_id}`);
    res.json({ accessToken });
  } catch (e) {
    console.error(e);
    res.status(403).json({ error: 'Invalid refresh token.' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ error: 'Missing refresh token.' });
    await revokeRefreshToken(token);
    console.info('Refresh token revoked and user logged out.');
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed.' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.user?.user_id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const putUser = async (req: Request, res: Response) => {
  try {
    const updated = await userUpdate(
      req.user?.user_id,
      req.body.email,
      req.body.password,
      req.body.profile_pic_uri,
      req.body.name,
      req.body.language,
      req.body.temp_unit,
    );
    if (!updated)
      return res.status(400).json({ error: 'No fields to update.' });
    console.info(`User updated: user_id=${updated.user_id}`);
    res.json({ message: 'User updated', user: updated });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await userDeletion(req.user?.user_id);
    if (!deleted) return res.status(404).json({ error: 'User not found.' });
    console.info(`User deleted: user_id=${deleted.user_id}`);
    res.json({ message: 'User deleted', user: deleted });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};
