// /api/participants.ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const participants = await prisma.user.findMany({
        where: {
          status: 'Confirmer', // Filtre pour les utilisateurs confirmés
        },
        select: {
          id: true,
          username: true,
        },
      });

      res.status(200).json(participants);
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des participants.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }
}