import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Récupérer tous les champs nécessaires depuis la base
    const projects = await prisma.project.findMany({
      select: {
        id: true, // ID du projet
        projectName: true, // Nom du projet
        startDate: true, // Date de début
        endDate: true, // Date de fin
        studyAmount: true, // Somme d'étude
        status: true, // Statut du projet (ajouté ici)
        description: true, // Description
        createdAt: true, // Date de création
        createdById: true, // ID du créateur
        createdBy: { // Inclure les informations du créateur
          select: {
            id: true, // ID du créateur
            username: true, // Nom d'utilisateur du créateur
            email: true, // (optionnel) Email du créateur
          },
        },
      },
    });
   
   
    res.status(200).json(projects); // Retourner les données
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des projets.' });
  }
}