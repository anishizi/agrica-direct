// File: pages/api/admin/users.ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch all users with their status
    try {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, status: true },
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else if (req.method === 'PATCH') {
    // Update the status of a specific user
    const { userId, newStatus } = req.body;

    if (!userId || !newStatus) {
      return res.status(400).json({ error: 'User ID and new status are required' });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });
      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Error updating user status' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}