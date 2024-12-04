import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }

  const userId = parseInt(req.query.userId as string, 10);

  if (!userId) {
    console.error('userId manquant ou invalide:', req.query.userId);
    return res.status(400).json({ message: 'userId est requis.' });
  }

  try {
    console.log('Requête reçue avec userId:', userId);

    // Récupérer tous les crédits associés à cet utilisateur, incluant tous les paiements des participants (sans filtrer sur userId)
    const credits = await prisma.credit.findMany({
        where: {
          payments: {
            some: {
              userId: userId,  // Filtrer pour s'assurer qu'il y a au moins un paiement pour l'utilisateur
            },
          },
        },
        include: {
          payments: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });

    // Organiser les paiements par mois/année (en ignorant l'heure)
    const formattedCredits = credits.map((credit) => ({
      ...credit,
      payments: credit.payments
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) // Trier par date
        .map((payment) => {
          // Extraire l'année et le mois uniquement
          const paymentDate = new Date(payment.dueDate);
          const yearMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`; // Format AAAA-MM

          return {
            ...payment,
            dueDate: yearMonth,  // Format mois/année uniquement (sans heure)
            status: payment.status || 'Non payé',
          };
        }),
      // Extraire uniquement le mois et l'année, pour éviter la comparaison des heures
      paymentDates: [...new Set(credit.payments.map(payment => {
        const paymentDate = new Date(payment.dueDate);
        return `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`; // Format AAAA-MM
      }))],
    }));

    // Renvoi des crédits formatés
    res.status(200).json(formattedCredits);

  } catch (error) {
    console.error('Erreur lors de la récupération des crédits:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}