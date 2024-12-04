import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id, projectName, startDate, endDate, studyAmount, description, status } = req.body;

  if (!id || !projectName || !startDate || !endDate || !studyAmount || !description || !status) {
    return res.status(400).json({ error: 'Tous les champs sont requis, y compris le statut.' });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        projectName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        studyAmount: parseFloat(studyAmount),
        description,
        status, // Ajout de la gestion du statut
      },
    });

    res.status(200).json({ message: 'Projet mis à jour avec succès.', project: updatedProject });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du projet.' });
  }
}