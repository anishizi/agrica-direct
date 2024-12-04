import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Weather from '../components/Weather'; // Assurez-vous que le chemin est correct

interface Credit {
  id: number;
  amount: number; // Montant total du crédit
  totalAmount: number; // Montant total à rembourser
  monthlyPayment: number; // Échéance par mois
  durationMonths: number; // Durée totale en mois
  startDate: string; // Date de début
}

interface Project {
  id: number;
  projectName: string;
  startDate: string;
  endDate: string;
  amount: number;
  description: string;
  status: string; // Statut du projet (par exemple, 'en cours', 'terminé', etc.)
}

const COULEURS = [
  '#A5D6A7', '#BBDEFB', '#FFCC80', '#D1C4E9', '#EF9A9A',
  '#F48FB1', '#80DEEA', '#FFF59D', '#C5E1A5', '#D1C4E9',
  '#AECBFA', '#D7CCC8', '#CFD8DC', '#A0D9D6'
];

const Home: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null); // For toggling project details
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification('Vous devez vous connecter.');
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserId(data.id);
        } else {
          setNotification('Erreur lors de la récupération des données utilisateur.');
          router.push('/login');
        }
      } catch (error) {
        setNotification('Erreur réseau lors de la récupération des données utilisateur.');
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  // Récupérer les crédits
  useEffect(() => {
    if (userId) {
      const fetchCredits = async () => {
        try {
          const response = await fetch(`/api/credits/getByUser?userId=${userId}`);
          if (!response.ok) throw new Error('Erreur lors de la récupération des crédits.');

          const data: Credit[] = await response.json();
          setCredits(data);
        } catch (error) {
          setNotification('Erreur réseau lors de la récupération des crédits.');
        } finally {
          setLoading(false);
        }
      };

      fetchCredits();
    }
  }, [userId]);

  // Récupérer les projets du mois en cours
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project/getProjects');
        if (!response.ok) throw new Error('Erreur lors de la récupération des projets.');

        const data: Project[] = await response.json();

        // Filtrer les projets du mois en cours
        const currentMonth = new Date().getMonth(); // Mois en cours (0-11)
        const currentYear = new Date().getFullYear();

        const filteredProjects = data.filter((project) => {
          const startDate = new Date(project.startDate);
          const endDate = new Date(project.endDate);

          return (
            (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
            (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear)
          );
        });

        setProjects(filteredProjects);
      } catch (error) {
        setNotification('Erreur réseau lors de la récupération des projets.');
      }
    };

    fetchProjects();
  }, [userId]);

  const calculateMonthsElapsed = (credit: Credit) => {
    const startDate = new Date(credit.startDate);
    const currentDate = new Date();
    const monthsElapsed = Math.min(
      Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 30)),
      credit.durationMonths
    ); // Limite au total des mois de la durée
    return monthsElapsed;
  };

  const handleProjectClick = (id: number) => {
    setSelectedProjectId(id === selectedProjectId ? null : id); // Toggle visibility of project details
  };

  if (notification) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-center text-red-500">{notification}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      
      {/* Météo */}
      <div className="mb-2">
        <Weather />
      </div>

      {/* Liste des crédits */}
      {credits.length > 0 ? (
        <div className="space-y-2"> {/* Réduction de l'espace entre les crédits */}
          {credits.map((credit) => {
            const monthsElapsed = calculateMonthsElapsed(credit);
            const monthsRemaining = credit.durationMonths - monthsElapsed; // Nombre de mois restants
            const progressMonths = (monthsElapsed / credit.durationMonths) * 100; // Progression des mois
            const amountPaid = credit.monthlyPayment * monthsElapsed; // Somme payée
            const progressAmount = (amountPaid / credit.totalAmount) * 100; // Progression de la somme payée
            const remainingAmount = credit.totalAmount - amountPaid; // Montant restant à payer

            return (
              <div
                key={credit.id}
                className="bg-white p-4 shadow-md rounded-md border border-gray-200"
              >
                {/* Ligne combinée pour la durée totale et l'échéance par mois */}
                <div className="flex items-center mt-2">
                  <p className="text-sm text-gray-600">
                    Durée: <span className="text-sm text-gray-600">{credit.durationMonths} mois</span>
                  </p>
                  <p className="text-sm text-gray-600 ml-auto">
                    Échéance: <span className="font-bold">{credit.monthlyPayment.toFixed(2)} €</span>
                  </p>
                </div>

                {/* Barre de progression des mois */}
                <div className="relative w-full bg-gray-200 rounded-full h-8 mt-2">
                  <div
                    className="absolute top-0 left-0 h-8 bg-blue-400 rounded-full"
                    style={{
                      width: `${progressMonths}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-sm text-black">
                    <span>Mois écoulés : {monthsElapsed}</span>
                    <span>Mois restants : {monthsRemaining}</span>
                  </div>
                </div>

                {/* Barre de progression des montants */}
                <div className="relative w-full bg-gray-200 rounded-full h-8 mt-4">
                  <div
                    className="absolute top-0 left-0 h-8 bg-green-400 rounded-full"
                    style={{
                      width: `${progressAmount}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-sm text-black">
                    <span>Payé : {amountPaid.toFixed(2)} €</span>
                    <span>Total : {credit.totalAmount.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Affichage du montant restant */}
                <div className="mt-2 text-sm text-gray-600">
                  Montant restant: <span className="font-bold">{remainingAmount.toFixed(2)} €</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-20">
          <p>Pas de crédit enregistré à votre nom.</p>
        </div>
      )}

      {/* Liste des projets du mois en cours */}
      <div className="text-center mt-2">
        {projects.length > 0 ? (
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 sm:px-0 lg:px-8"> {/* Réduction de l'espace entre les projets */}
              {projects.map((project, index) => {
                const backgroundColor = COULEURS[index % COULEURS.length]; // Cycle les couleurs de fond

                return (
                  <div
                    key={project.id}
                    className="p-2 shadow-sm rounded-lg border border-gray-300 hover:shadow-md transition duration-200 ease-in-out overflow-hidden"
                    style={{ backgroundColor }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-black truncate">{project.projectName}</h3>
                      <button
                        onClick={() => handleProjectClick(project.id)}
                        className="text-blue-500 text-sm"
                      >
                        {selectedProjectId === project.id ? '-' : '+'}
                      </button>
                    </div>

                    {selectedProjectId === project.id && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          <strong>Dates: </strong>
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </div>

                        <div className="mt-2 text-sm">
                          <span className="font-semibold">Statut:</span>
                          <span className={`ml-1 ${project.status === 'en cours' ? 'text-green-600' : 'text-gray-600'}`}>
                            {project.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-2">
            <p>Aucun projet en cours.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
