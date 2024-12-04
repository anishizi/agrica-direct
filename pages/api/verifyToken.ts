import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Le token est requis' });
    }

    try {
      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Récupérer l'utilisateur associé au token
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (user) {
        return res.status(200).json({ valid: true });
      } else {
        return res.status(401).json({ valid: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return res.status(401).json({ valid: false });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}