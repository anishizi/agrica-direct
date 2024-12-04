import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Récupération de tous les soldes
      const soldes = await prisma.solde.findMany({
        orderBy: {
          addedAt: 'desc', // Tri par date ajoutée, du plus récent au plus ancien
        },
      });

      res.status(200).json(soldes);
    } catch (error) {
      console.error('Erreur lors de la récupération des soldes :', error);
      res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }
}