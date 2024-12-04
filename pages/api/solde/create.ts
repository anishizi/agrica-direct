import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount, source, addedAt } = req.body;

    // Vérification des données reçues
    if (
      typeof amount !== 'number' ||
      typeof source !== 'string' ||
      !source.trim() ||
      !addedAt
    ) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires et doivent être valides.' });
    }

    try {
      // Création d'un nouveau solde
      const solde = await prisma.solde.create({
        data: {
          amount: parseFloat(amount.toFixed(2)), // Arrondi à 2 décimales
          source: source.trim(),
          addedAt: new Date(addedAt),
        },
      });

      res.status(201).json({
        message: 'Solde créé avec succès.',
        solde,
      });
    } catch (error) {
      console.error('Erreur lors de la création du solde:', error);
      res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }
}