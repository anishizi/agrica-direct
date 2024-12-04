import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import nextConnect from "next-connect";

const prisma = new PrismaClient();

// Répertoire pour stocker les fichiers
const uploadDir = "./public/uploads";

// Créer le répertoire d'uploads s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Répertoire de destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix); // Renommage des fichiers
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de taille de fichier : 5 Mo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté."));
    }
  },
});

// Middleware avec next-connect
const apiRoute = nextConnect({
  onError(error, req, res: NextApiResponse) {
    res.status(500).json({ error: error.message });
  },
  onNoMatch(req, res: NextApiResponse) {
    res.status(405).json({ error: "Méthode non autorisée." });
  },
}).use(upload.single("invoiceFile")); // Champ attendu pour le fichier

apiRoute.put(async (req: any, res: NextApiResponse) => {
  try {
    const { id, description, unitPrice, quantity } = req.body;

    if (!id || !description || !unitPrice || !quantity) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 1 ||
      description.trim().length > 30
    ) {
      return res.status(400).json({
        error: "La description doit contenir entre 1 et 30 caractères.",
      });
    }

    if (isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) {
      return res.status(400).json({
        error: "Le prix unitaire doit être un nombre valide supérieur à 0.",
      });
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        error: "La quantité doit être un nombre valide supérieur à 0.",
      });
    }

    const total = Number(unitPrice) * Number(quantity);

    const existingExpense = await prisma.expense.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: "Dépense introuvable." });
    }

    // Gérer le fichier uploadé
    let newFilePath = existingExpense.invoiceFile;
    if (req.file) {
      const fileName = req.file.filename;
      newFilePath = `/uploads/${fileName}`;

      // Supprimer l'ancien fichier
      if (existingExpense.invoiceFile) {
        const oldFilePath = path.join("./public", existingExpense.invoiceFile);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id, 10) },
      data: {
        description: description.trim(),
        unitPrice: parseFloat(unitPrice),
        quantity: parseInt(quantity, 10),
        total: parseFloat(total.toFixed(2)),
        invoiceFile: newFilePath,
      },
    });

    return res.status(200).json({
      message: "Dépense mise à jour avec succès.",
      expense: updatedExpense,
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la dépense :", error);
    return res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Nécessaire pour Multer
  },
};

export default apiRoute;