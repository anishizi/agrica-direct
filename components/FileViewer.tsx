import React from "react";

interface FileViewerProps {
  fileUrl: string; // URL du fichier à afficher
  onClose: () => void; // Fonction pour fermer le popup
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, onClose }) => {
  const handleDownload = () => {
    // Crée un lien pour télécharger le fichier
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "fichier";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(fileUrl, "_blank");
    if (printWindow) {
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-4 w-full max-w-5xl h-[90%] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Aperçu du fichier</h2>
          <button
            className="bg-gray-100 rounded-full p-2 hover:bg-gray-200"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✖
          </button>
        </div>

        {/* Affichage du fichier selon son type */}
        {fileUrl.endsWith(".pdf") ? (
          <embed src={fileUrl} type="application/pdf" className="w-full h-full" />
        ) : fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img
            src={fileUrl}
            alt="Aperçu du fichier"
            className="w-full h-auto object-contain"
          />
        ) : (
          <p className="text-gray-500">
            Ce fichier ne peut pas être prévisualisé. <a href={fileUrl} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Cliquez ici pour l'ouvrir.</a>
          </p>
        )}

        {/* Boutons pour télécharger ou imprimer */}
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Télécharger
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;