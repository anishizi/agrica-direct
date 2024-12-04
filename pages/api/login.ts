// File: pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Vérifie si l'email et le mot de passe sont définis
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    try {
      // Recherche l'utilisateur par email
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérification du statut de l'utilisateur
      if (user.status === 'A verifier') {
        return res.status(403).json({
          error: 'Votre compte est en attente de vérification par un administrateur.',
        });
      } else if (user.status === 'Rejecter') {
        return res.status(403).json({ error: 'Votre compte a été rejeté.' });
      }

      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Mot de passe incorrect' });
      }

      // Enregistrer l'historique de connexion
      await prisma.connectionHistory.create({
        data: {
          userId: user.id,
          dateTime: new Date(),
        },
      });

      // Génération du token JWT sans expiration
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);

      res.status(200).json({ token });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
