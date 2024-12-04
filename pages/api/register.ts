// pages/api/register.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    try {
      // Vérifiez si l'utilisateur existe déjà par email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      // Vérifiez si le nom d'utilisateur est déjà pris
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Nom d’utilisateur déjà utilisé' });
      }

      // Hachez le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créez le nouvel utilisateur avec le statut par défaut "A verifier"
      const user = await prisma.user.create({
        data: { username, email, password: hashedPassword, status: 'A verifier' },
      });

      return res.status(201).json({ message: 'Utilisateur créé avec succès', user });
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de l’utilisateur :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}