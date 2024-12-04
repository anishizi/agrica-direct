import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  // Validation de l'ID
  if (!id || Array.isArray(id) || isNaN(Number(id))) {
    console.error('ID invalide ou manquant:', id);
    return res.status(400).json({ error: 'Un ID valide est requis pour supprimer un projet.' });
  }

  try {
    const projectId = parseInt(id as string, 10);

    console.log(`Recherche du projet avec ID : ${projectId}`);

    // Vérifier si le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.error(`Projet avec ID ${projectId} introuvable.`);
      return res.status(404).json({ error: 'Projet non trouvé.' });
    }

    console.log(`Projet trouvé, suppression en cours : ${projectId}`);

    // Supprimer le projet
    await prisma.project.delete({
      where: { id: projectId },
    });

    console.log(`Projet supprimé avec succès : ${projectId}`);
    res.status(200).json({ message: 'Projet supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet :', error);

    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      // Gestion spécifique pour les contraintes de clé étrangère
      return res.status(400).json({
        error: 'Impossible de supprimer le projet car il est lié à d\'autres données.',
      });
    }

    res.status(500).json({ error: 'Erreur serveur lors de la suppression du projet.' });
  } finally {
    await prisma.$disconnect();
  }
}