import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "L'ID de la dépense est obligatoire." });
  }

  try {
    // Récupérer la dépense pour obtenir le chemin du fichier associé
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!expense) {
      return res.status(404).json({ error: "Dépense introuvable." });
    }

    // Construire le chemin absolu du fichier
    if (expense.invoiceFile) {
      const filePath = path.join("./public", expense.invoiceFile);
      
      // Vérifier si le fichier existe
      if (fs.existsSync(filePath)) {
        try {
          // Supprimer le fichier
          fs.unlinkSync(filePath);
          console.log(`Fichier supprimé : ${filePath}`);
        } catch (err) {
          console.error("Erreur lors de la suppression du fichier :", err);
          return res.status(500).json({ error: "Erreur lors de la suppression du fichier." });
        }
      }
    }

    // Supprimer l'entrée dans la base de données
    await prisma.expense.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.status(200).json({ message: "Dépense et fichier associés supprimés avec succès." });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la dépense :", error);
    return res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
}