// pages/api/user.ts

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      // Vérification et décodage du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, email: true }, // Récupère id, username, email
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json(user); // Retourne id, username, email
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(403).json({ error: 'Token invalide' });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}