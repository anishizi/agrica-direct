import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { projectName, startDate, endDate, studyAmount, description, createdById } = req.body;

  try {
    // Vérification des données
    if (!projectName || !startDate || !endDate || !studyAmount || !description || !createdById) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Vérifiez si c'est un projet "par défaut"
    const isDefaultProject = projectName.toLowerCase() === 'default';

    // Préparer les données pour le projet par défaut
    const projectData = isDefaultProject
      ? {
          projectName: 'Default', // Nom standardisé pour le projet par défaut
          startDate: new Date(),
          endDate: new Date(),
          studyAmount: 0, // Valeur par défaut
          description: 'Projet par défaut pour les dépenses',
          createdById: 0, // ID standardisé, peut être modifié si nécessaire
        }
      : {
          projectName,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          studyAmount: parseFloat(studyAmount),
          description,
          createdById,
        };

    // Créer le projet
    const newProject = await prisma.project.create({ data: projectData });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erreur lors de la création du projet :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du projet.' });
  }
}