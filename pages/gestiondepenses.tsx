import React, { useState, useEffect } from "react";
import NotificationPopup from "../components/NotificationPopup";
import { FaEdit, FaTrash } from "react-icons/fa";


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
}

const GestionDepenses: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [mathQuestion, setMathQuestion] = useState<string>("");
  const [mathAnswer, setMathAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");

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

  // Charger les dépenses pour le projet sélectionné
  const fetchExpenses = async (projectId: number) => {
    setLoadingExpenses(true);
    try {
      const response = await fetch(`/api/expenses/getByProject?projectId=${projectId}`);
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

  useEffect(() => {
    if (selectedProjectId) {
      fetchExpenses(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Générer une question mathématique
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? "+" : "*";
    const question = `${num1} ${operation} ${num2}`;
    const answer = eval(question).toString(); // Évaluer le résultat
    setMathQuestion(question);
    setMathAnswer(answer);
  };

  // Calculer le total des dépenses
  const totalDepenses = expenses.reduce((sum, expense) => sum + expense.total, 0);

  // Formater les montants
  const formatCurrency = (amount: number): string =>
    Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Gérer la modification
  const handleEditSubmit = async (updatedExpense: Expense) => {
    try {
      const response = await fetch("/api/expenses/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExpense),
      });

      if (response.ok) {
        setNotification({ message: "Dépense modifiée avec succès.", type: "success" });
        if (selectedProjectId) fetchExpenses(selectedProjectId);
      } else {
        setNotification({ message: "Erreur lors de la modification de la dépense.", type: "error" });
      }
    } catch (error) {
      setNotification({
        message: "Erreur réseau lors de la modification de la dépense.",
        type: "error",
      });
    } finally {
      setEditExpense(null);
    }
  };

  // Gérer la suppression
  const handleDeleteExpense = async () => {
    if (!deleteExpense) return;
  
    // Vérifier la réponse mathématique
    if (userAnswer !== mathAnswer) {
      setNotification({
        message: "La réponse à la question mathématique est incorrecte.",
        type: "error",
      });
      return;
    }
  
    try {
      // Appeler l'API pour supprimer la dépense
      const response = await fetch("/api/expenses/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteExpense.id }),
      });
  
      if (response.ok) {
        setNotification({ message: "Dépense supprimée avec succès.", type: "success" });
        // Recharger les dépenses après suppression
        if (selectedProjectId) fetchExpenses(selectedProjectId);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.error || "Erreur lors de la suppression.", type: "error" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setNotification({
        message: "Erreur réseau lors de la suppression.",
        type: "error",
      });
    } finally {
      setDeleteExpense(null);
      setShowDeletePopup(false);
      setUserAnswer("");
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-4">
         <h1 className="text-2xl font-semibold mb-4">GESTION DES DEPENSES</h1>
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
            <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-200 px-2 py-1">Description</th>
                <th className="border border-gray-200 px-2 py-1 text-center">PU</th>
                <th className="border border-gray-200 px-2 py-1 text-center">Qt</th>
                <th className="border border-gray-200 px-2 py-1 text-center">Total (TND)</th>
                <th className="border border-gray-200 px-2 py-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="border border-gray-200 px-2 py-1">{expense.description.slice(0, 10)}</td>
                  <td className="border border-gray-200 px-2 py-1 text-center whitespace-nowrap">
                    {formatCurrency(expense.unitPrice)}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-center whitespace-nowrap">
                    {expense.quantity}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-center whitespace-nowrap">
                    {formatCurrency(expense.total)}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-center">
  <FaEdit
    className="text-blue-500 hover:text-blue-700 cursor-pointer inline-block"
    onClick={() => setEditExpense(expense)}
    title="Modifier"
  />
  <FaTrash
    className="text-red-500 hover:text-red-700 cursor-pointer inline-block ml-2"
    onClick={() => {
      setDeleteExpense(expense);
      generateMathQuestion();
      setShowDeletePopup(true);
    }}
    title="Supprimer"
  />
</td>

                </tr>
              ))}
            </tbody>
          </table>
          
          ) : (
            <p className="text-gray-500">Ce projet n'a pas de dépense.</p>
          )}
        </div>
      )}

      {/* Total des dépenses */}
      {expenses.length > 0 && (
        <div className="mt-4 p-2 bg-gray-100 rounded-lg shadow flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">Total Dépenses :</h2>
          <p className="text-2xl font-bold text-gray-500">{formatCurrency(totalDepenses)} TND</p>
        </div>
      )}

      {/* Popup de modification */}
     {/* Popup de modification */}
{editExpense && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white rounded-lg p-4 shadow-lg w-96">
      <h2 className="text-lg font-bold text-gray-700 mb-4">Modifier la dépense</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          // Créer un objet FormData pour inclure le fichier s'il est présent
          const formData = new FormData();
          formData.append("id", editExpense.id.toString());
          formData.append("description", editExpense.description);
          formData.append("unitPrice", editExpense.unitPrice.toString());
          formData.append("quantity", editExpense.quantity.toString());

          // Inclure le fichier s'il a été modifié
          const fileInput = document.getElementById("edit-invoice-file") as HTMLInputElement;
          if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append("invoiceFile", fileInput.files[0]);
          }

          try {
            const response = await fetch("/api/expenses/update", {
              method: "PUT",
              body: formData,
            });

            if (response.ok) {
              setNotification({
                message: "Dépense modifiée avec succès.",
                type: "success",
              });
              if (selectedProjectId) fetchExpenses(selectedProjectId);
            } else {
              const errorData = await response.json();
              setNotification({
                message: errorData.error || "Erreur lors de la modification.",
                type: "error",
              });
            }
          } catch (error) {
            setNotification({
              message: "Erreur réseau lors de la modification.",
              type: "error",
            });
          } finally {
            setEditExpense(null);
          }
        }}
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={editExpense.description}
            onChange={(e) =>
              setEditExpense({ ...editExpense, description: e.target.value })
            }
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Prix unitaire</label>
          <input
            type="number"
            value={editExpense.unitPrice}
            onChange={(e) =>
              setEditExpense({
                ...editExpense,
                unitPrice: parseFloat(e.target.value),
              })
            }
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quantité</label>
          <input
            type="number"
            value={editExpense.quantity}
            onChange={(e) =>
              setEditExpense({
                ...editExpense,
                quantity: parseInt(e.target.value, 10),
              })
            }
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Fichier de facture</label>
          <input
            type="file"
            id="edit-invoice-file"
            accept=".pdf, image/*"
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => setEditExpense(null)}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Popup de suppression */}
      {showDeletePopup && deleteExpense && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg p-4 shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-4">
              Résolvez cette question pour confirmer : <strong>{mathQuestion}</strong>
            </p>
            <input
              type="text"
              placeholder="Votre réponse"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full mb-4 border rounded p-2"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setShowDeletePopup(false)}
              >
                Annuler
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleDeleteExpense}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
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

export default GestionDepenses;
