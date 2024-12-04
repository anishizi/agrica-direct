import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, baseAmount, totalAmount, monthlyPayment, duration, interestRate, fees, startDate, selectedParticipants } = req.body;

    // Vérification des données reçues
    if (
      !userId ||
      typeof baseAmount !== 'number' ||
      typeof totalAmount !== 'number' ||
      typeof monthlyPayment !== 'number' ||
      typeof duration !== 'number' ||
      typeof interestRate !== 'number' ||
      typeof fees !== 'number' ||
      !startDate ||
      !Array.isArray(selectedParticipants) ||
      selectedParticipants.length === 0
    ) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires et doivent être valides.' });
    }

    try {
      // Création du crédit global avec arrondi à 2 décimales
      const credit = await prisma.credit.create({
        data: {
          amount: parseFloat(baseAmount.toFixed(2)),  // Arrondi à 2 décimales
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
          durationMonths: duration,
          interestRate: parseFloat(interestRate.toFixed(2)),
          fees: parseFloat(fees.toFixed(2)),
          startDate: new Date(startDate),
        },
      });

      // Calcul du montant par participant
      const paymentPerParticipant = parseFloat((monthlyPayment / selectedParticipants.length).toFixed(2));

      const paymentPromises = [];

      // Génération des paiements pour chaque mois, en respectant l'ordre des dates croissantes
      for (let month = 0; month < duration; month++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + month);

        // Réinitialiser le jour à 1er du mois (pour ne garder que le mois et l'année)
        dueDate.setDate(1);  // On définit le jour au 1er du mois pour garantir la cohérence

        // Création de chaque paiement pour chaque participant
        for (const participantId of selectedParticipants) {
          paymentPromises.push(
            prisma.payment.create({
              data: {
                creditId: credit.id,
                userId: participantId,
                amount: paymentPerParticipant,
                dueDate: dueDate,
                status: 'Non payé', // Statut par défaut
              },
            })
          );
        }
      }

      await Promise.all(paymentPromises);

      res.status(201).json({
        message: 'Crédit créé avec succès.',
        credit,
      });
    } catch (error) {
      console.error('Erreur lors de la création du crédit:', error);
      res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }
}