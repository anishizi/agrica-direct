// File: pages/api/connection-history.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Importer JwtPayload pour le typage

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Extract userId from the token
    const userId = decodedToken.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Vérifiez si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Fetch connection history for all users
    const history = await prisma.connectionHistory.findMany({
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { dateTime: 'desc' }, // Sort by most recent
    });

    // Map history data to include user information
    const formattedHistory = history.map((entry) => ({
      userId: entry.userId,
      username: entry.user.username,
      dateTime: entry.dateTime,
    }));

    res.status(200).json({ history: formattedHistory });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}