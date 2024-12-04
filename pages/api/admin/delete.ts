// File: pages/api/admin/delete.ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next'; // Import des types nécessaires

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // Supprimer l'utilisateur ; les enregistrements liés seront supprimés en cascade si configuré
      await prisma.user.delete({
        where: { id: userId },
      });

      res.status(200).json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
      console.error('Error deleting user and related data:', error);
      res.status(500).json({ error: 'Failed to delete user and related data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}