import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus } from "react-icons/fa";
import ExpenseCreationPopup from "../components/ExpenseCreationPopup";
import NotificationPopup from "../components/NotificationPopup";
import FileViewer from "../components/FileViewer"; // Remplacez par le bon chemin d'import


interface Project {
  id: number;
  projectName: string;
}

interface Expense {
  id: number;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
  createdAt: string;
  invoiceFile?: string; // URL ou chemin du fichier facture
}

const DepensePage: React.FC = () => {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<string | null>(null);
// Fonction pour adapter l'URL du fichier
const getFileUrl = (filePath: string | undefined): string => {
  // Vérifiez que le fichier a bien un chemin valide
  if (!filePath) {
    console.error("Le chemin du fichier est invalide :", filePath);
    return ""; // Retourne une chaîne vide si le chemin est invalide
  }

  // Vérifiez que le fichier est dans le dossier /uploads
  if (filePath.startsWith("/uploads")) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${filePath}`;
  } else {
    console.error("Le fichier n'est pas dans /uploads :", filePath);
    return ""; // Retourne une chaîne vide si le chemin est incorrect
  }
};


  // Charger les projets
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/getProjects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          setNotification({
            message: "Erreur lors de la récupération des projets.",
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          message: "Erreur réseau lors de la récupération des projets.",
          type: "error",
        });
      }
    };

    fetchProjects();
  }, []);

  // Charger le projectId depuis l'URL
  useEffect(() => {
    if (router.query.projectId) {
      setSelectedProjectId(Number(router.query.projectId));
    }
  }, [router.query]);

  // Charger les dépenses pour le projet sélectionné
  useEffect(() => {
    if (selectedProjectId) {
      const fetchExpenses = async () => {
        setLoadingExpenses(true);
        try {
          const response = await fetch(
            `/api/expenses/getByProject?projectId=${selectedProjectId}`
          );
          if (response.ok) {
            const data = await response.json();
            setExpenses(data);
          } else {
            setExpenses([]);
          }
        } catch (error) {
          setNotification({
            message: "Erreur réseau lors de la récupération des dépenses.",
            type: "error",
          });
        } finally {
          setLoadingExpenses(false);
        }
      };

      fetchExpenses();
    }
  }, [selectedProjectId]);

  // Calculer le total des dépenses
  const totalDepenses = expenses.reduce((sum, expense) => sum + expense.total, 0);

  // Formater les montants avec un espace pour les milliers
  const formatCurrency = (amount: number): string =>
    Math.floor(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const handleExpenseSubmit = async (expenseData: any) => {
    try {
      const response = await fetch("/api/expenses/create", {
        method: "POST",
        body: expenseData, // FormData avec fichier inclus
      });

      if (response.ok) {
        setNotification({
          message: "Dépense créée avec succès.",
          type: "success",
        });

        // Recharger les dépenses après ajout
        if (selectedProjectId) {
          const projectId = selectedProjectId;
          setSelectedProjectId(null);
          setTimeout(() => setSelectedProjectId(projectId), 500);
        }
      } else {
        const errorData = await response.json();
        setNotification({
          message: `Erreur : ${errorData.error}`,
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: "Erreur réseau lors de la création de la dépense.",
        type: "error",
      });
    } finally {
      setShowPopup(false);
    }
  };

  return (
    <div className="container mx-auto px-2 py-2">
      {/* Bouton flottant pour ajouter une dépense */}
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-blue-500 text-white rounded-full p-2 shadow-lg"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus size={20} />
        </button>
      </div>

      {/* Liste déroulante pour sélectionner un projet */}
      {projects.length > 0 && (
        <div className="mb-4">
          <label htmlFor="project-select" className="block mb-2 text-gray-700">
            Sélectionnez un projet :
          </label>
          <select
            id="project-select"
            className="w-full border rounded p-2"
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            value={selectedProjectId ?? ""}
          >
            <option value="">-- Sélectionnez un projet --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Liste des dépenses */}
      {selectedProjectId && (
        <div>
          {loadingExpenses ? (
            <p>Chargement des dépenses...</p>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
  <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="border border-gray-200 px-2 py-2">Description</th>
        <th className="border border-gray-200 px-2 py-2 text-right">PU</th>
        <th className="border border-gray-200 px-2 py-2 text-right">Qt</th>
        <th className="border border-gray-200 px-2 py-2 text-right">Total (TND)</th>
      </tr>
    </thead>
    <tbody>
  {expenses.map((expense) => (
    <tr key={expense.id}>
      {/* Description */}
      <td className="border border-gray-200 px-2 py-2 text-center">
      {expense.invoiceFile ? (
  <button
    onClick={() => {
      // Vérifier et afficher le chemin du fichier dans la console pour déboguer
      const fileUrl = getFileUrl(expense.invoiceFile);
      console.log("Fichier URL : ", fileUrl); // Debugging
      if (fileUrl) {
        setSelectedInvoiceFile(fileUrl);  // Mettre à jour l'état si l'URL est valide
      }
    }}
    className="text-blue-500 underline hover:text-blue-700"
  >
    {expense.description}
  </button>
) : (
  <span>{expense.description}</span>
)}


      </td>

      {/* Prix unitaire */}
      <td className="border border-gray-200 px-2 py-2 text-right whitespace-nowrap">
        {formatCurrency(expense.unitPrice)}
      </td>

      {/* Quantité */}
      <td className="border border-gray-200 px-2 py-2 text-right">{expense.quantity}</td>

      {/* Total */}
      <td className="border border-gray-200 px-2 py-2 text-right whitespace-nowrap">
        {formatCurrency(expense.total)}
      </td>
    </tr>
  ))}
</tbody>

  </table>
</div>

          ) : (
            <p className="text-gray-500">Ce projet n'a pas de dépense.</p>
          )}

          {/* Total des dépenses */}
          {expenses.length > 0 && (
            <div className="mt-4 p-2 bg-gray-100 rounded-lg shadow flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Total Dépenses :</h2>
              <p className="text-2xl font-bold text-gray-500">
                {formatCurrency(totalDepenses)} TND
              </p>
            </div>
          )}
        </div>
      )}

     {/* Popup pour afficher une facture */ }
     {selectedInvoiceFile && (
  <FileViewer
    fileUrl={selectedInvoiceFile}
    onClose={() => setSelectedInvoiceFile(null)}
  />
)}




      {/* Popup pour créer une dépense */}
      {showPopup && (
        <ExpenseCreationPopup
          onClose={() => setShowPopup(false)}
          onSubmit={handleExpenseSubmit}
        />
      )}

      {/* Notification Popup */}
      {notification.type && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: null })}
        />
      )}
    </div>
  );
};

export default DepensePage;