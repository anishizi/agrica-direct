import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée.` });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: 'paymentId est requis.' });
  }

  try {
    // Mettre à jour le statut du paiement
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: 'Payé',
      },
    });

    return res.status(200).json({ message: 'Statut du paiement mis à jour.', payment: updatedPayment });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}