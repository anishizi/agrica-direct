import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus } from "react-icons/fa";
import SoldePopup from "../components/SoldePopup";
import NotificationPopup from "../components/NotificationPopup";

interface Solde {
  id: number;
  amount: number;
  source: string;
  addedAt: string;
}

interface Project {
  id: number;
  projectName: string;
  studyAmount?: number; // Ajout de la propriété "studyAmount"
  totalExpenses?: number; // Total des dépenses pour le projet
}

const BalancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [soldes, setSoldes] = useState<Solde[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  // Récupérer les soldes
  const fetchSoldes = async () => {
    try {
      const response = await fetch("/api/solde");
      if (response.ok) {
        const data = await response.json();
        setSoldes(data);
      } else {
        setNotification({ message: "Erreur lors de la récupération des soldes.", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Erreur réseau lors de la récupération des soldes.", type: "error" });
    }
  };

  // Récupérer les projets et calculer les dépenses
  const fetchProjects = async () => {
    try {
      const projectResponse = await fetch("/api/project/getProjects");
      if (!projectResponse.ok) {
        throw new Error("Erreur lors de la récupération des projets.");
      }
      const projectData = await projectResponse.json();

      // Ajouter les dépenses et l'étude pour chaque projet
      const projectsWithDetails = await Promise.all(
        projectData.map(async (project: Project) => {
          const expenseResponse = await fetch(`/api/expenses/getByProject?projectId=${project.id}`);
          const expenses = expenseResponse.ok ? await expenseResponse.json() : [];
          const totalExpenses = expenses.reduce(
            (sum: number, expense: { total: number }) => sum + expense.total,
            0
          );
          return { ...project, totalExpenses };
        })
      );

      setProjects(projectsWithDetails);
    } catch (error) {
      console.error(error);
      setNotification({
        message: "Erreur lors de la récupération des projets et des dépenses.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    fetchSoldes();
    fetchProjects();
  }, []);

  // Gérer l'ajout d'un solde
  const handleAddSolde = async (soldeData: { amount: number; source: string; addedAt: string }) => {
    try {
      const response = await fetch("/api/solde/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soldeData),
      });

      if (response.ok) {
        fetchSoldes();
        setNotification({ message: "Solde ajouté avec succès.", type: "success" });
      } else {
        setNotification({ message: "Erreur lors de l’ajout du solde.", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Erreur réseau lors de l’ajout du solde.", type: "error" });
    } finally {
      setShowPopup(false);
    }
  };

  // Calcul du total des soldes
  const totalTresorerie = soldes.reduce((sum, solde) => sum + solde.amount, 0);

  // Calcul du total des dépenses pour tous les projets
  const totalDepenses = projects.reduce((sum, project) => sum + (project.totalExpenses || 0), 0);

  // Calcul de la trésorerie restante
  const remainingTresorerie = totalTresorerie - totalDepenses;

  // Redirection vers la page des dépenses
  const handleDetailClick = (projectId: number) => {
    router.push(`/depense?projectId=${projectId}`);
  };

  // Formater les montants
  const formatCurrency = (amount: number): string => {
    return Math.floor(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Fonction pour tronquer le nom du projet si trop long
  const truncateProjectName = (name: string, maxLength: number) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + "...";
    }
    return name;
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="container mx-auto px-2">
      {/* Bouton flottant */}
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 focus:outline-none"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus size={20} />
        </button>
      </div>

      {/* Tableau des soldes */}
      <div className="mt-2">
        <h2 className="text-xl font-semibold mb-2">Liste des Trésorerie</h2>
        {soldes.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-200 px-4 py-2">Date</th>
                <th className="border border-gray-200 px-4 py-2">Montant (TND)</th>
                <th className="border border-gray-200 px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {soldes.map((solde) => (
                <tr key={solde.id}>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(solde.addedAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {formatCurrency(solde.amount)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">{solde.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Aucun solde enregistré.</p>
        )}
      </div>

      {/* Total Trésorerie */}
      <div className="mt-2 p-2 bg-gray-100 rounded-lg shadow flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Trésorerie :</h2>
        <p className="text-2xl font-bold text-gray-500">{formatCurrency(totalTresorerie)} TND</p>
      </div>

      {/* Trésorerie Restante */}
      <div
        className={`mt-2 p-2 bg-gray-100 rounded-lg shadow flex items-center justify-between ${
          remainingTresorerie >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        <h2 className="text-lg font-semibold text-gray-700">Trésorerie Restante :</h2>
        <p className="text-2xl font-bold">
          {formatCurrency(remainingTresorerie)} TND
        </p>
      </div>

      {/* Tableau des projets et leurs dépenses */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Projets et Dépenses</h2>
        {projects.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-200 px-4 py-2">Projet</th>
                <th className="border border-gray-200 px-4 py-2">Total Dépenses (TND)</th>
                <th className="border border-gray-200 px-4 py-2">Étude (TND)</th>
                <th className="border border-gray-200 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const isExpenseHigher = (project.totalExpenses || 0) > (project.studyAmount || 0);
                const expenseColorClass = isExpenseHigher ? "text-red-500" : "text-green-500";

                return (
                  <tr key={project.id}>
                    <td className="border border-gray-200 px-4 py-2">
                      {truncateProjectName(project.projectName, 20)}
                    </td>
                    <td
                      className={`border border-gray-200 px-4 py-2 text-right ${expenseColorClass}`}
                    >
                      {formatCurrency(project.totalExpenses || 0)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {formatCurrency(project.studyAmount || 0)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <button
                        onClick={() => handleDetailClick(project.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Aucun projet enregistré.</p>
        )}
      </div>

      {/* Total Dépenses */}
      <div className="mt-2 p-2 bg-gray-100 rounded-lg shadow flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Dépenses Totales :</h2>
        <p className="text-2xl font-bold text-gray-500">{formatCurrency(totalDepenses)} TND</p>
      </div>

      {/* Popup de création de solde */}
      {showPopup && <SoldePopup onClose={() => setShowPopup(false)} onSubmit={handleAddSolde} />}

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

export default BalancePage;
