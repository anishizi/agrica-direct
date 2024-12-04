import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée.` });
  }

  const { projectId } = req.query;

  try {
    // Valider le projectId
    const numericProjectId = parseInt(projectId as string, 10);
    if (isNaN(numericProjectId)) {
      return res.status(400).json({ error: "ID de projet invalide." });
    }

    // Rechercher les dépenses liées au projet
    const expenses = await prisma.expense.findMany({
      where: {
        projectId: numericProjectId,
      },
      select: {
        id: true,
        description: true,
        unitPrice: true,
        quantity: true,
        total: true,
        createdAt: true,
        invoiceFile: true, // Inclure le chemin du fichier de facture
      },
    });

    // Retourner une réponse vide si aucune dépense n'est trouvée
    if (expenses.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des dépenses." });
  }
}