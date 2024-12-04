import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Récupérer le chemin du fichier depuis la requête
  const { path: filePath } = req.query;

  // Vérifier si filePath existe et est une chaîne de caractères
  if (!filePath || typeof filePath !== "string") {
    return res.status(400).json({ error: "Chemin du fichier invalide." });
  }

  // Construire le chemin absolu vers le fichier
  const fullPath = path.join(process.cwd(), "public/uploads", filePath);

  // Vérifier si le fichier existe
  if (fs.existsSync(fullPath)) {
    const fileType = path.extname(fullPath).toLowerCase();
    const mimeType = fileType === ".pdf" ? "application/pdf" : `image/${fileType.slice(1)}`;

    // Définir l'en-tête Content-Type
    res.setHeader("Content-Type", mimeType);

    // Lire et retourner le fichier
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } else {
    res.status(404).json({ error: "Fichier non trouvé." });
  }
}