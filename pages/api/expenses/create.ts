import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import nextConnect from "next-connect"; // Nécessaire pour utiliser Multer avec Next.js

const prisma = new PrismaClient();

// Répertoire pour stocker les fichiers
const uploadDir = "./public/uploads";

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurer Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Répertoire de destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix); // Renommage du fichier
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"));
    }
  },
});

// Middleware pour gérer les fichiers avec next-connect
const apiRoute = nextConnect({
  onError(error, req, res: NextApiResponse) {
    res.status(500).json({ error: error.message });
  },
  onNoMatch(req, res: NextApiResponse) {
    res.status(405).json({ error: "Méthode non autorisée." });
  },
}).use(upload.single("invoiceFile")); // Champ attendu pour le fichier

apiRoute.post(async (req: any, res: NextApiResponse) => {
  try {
    const { projectId, description, unitPrice, quantity } = req.body;

    // Validation des champs
    if (!projectId || !description || !unitPrice || !quantity) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 1 ||
      description.trim().length > 30
    ) {
      return res.status(400).json({
        error: "La description est obligatoire et doit contenir entre 1 et 30 caractères.",
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

    // Vérifier et traiter le fichier
    let filePath = null;
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
    }

    // Créer l'entrée dans la base de données
    const expense = await prisma.expense.create({
      data: {
        projectId: parseInt(projectId, 10),
        description: description.trim(),
        unitPrice: parseFloat(unitPrice),
        quantity: parseInt(quantity, 10),
        total: parseFloat(total.toFixed(2)),
        invoiceFile: filePath,
      },
    });

    res.status(201).json({ message: "Dépense créée avec succès.", expense });
  } catch (error: any) {
    console.error("Erreur lors de la création de la dépense :", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Le projet spécifié n'existe pas.",
      });
    }

    res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Désactiver bodyParser pour utiliser Multer
  },
};

export default apiRoute;