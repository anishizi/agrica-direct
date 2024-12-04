import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlus } from 'react-icons/fa';
import TaskPopup from '../components/TaskPopup';
import NotificationPopup from '../components/NotificationPopup';
import CalendarGanttChart from '../components/CalendarGanttChart'; // Ajouter votre composant Gantt Chart
import { Project } from '../types/Project';





const TaskPage: React.FC = () => {
 
  

  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
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
          setUsername(data.username);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Récupération des projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project/getProjects', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          const formattedProjects: Project[] = data.map((project: any) => ({
            projectName: project.projectName,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
          }));
          setProjects(formattedProjects);
        } else {
          console.error('Erreur lors de la récupération des projets');
        }
      } catch (error) {
        console.error('Erreur réseau lors de la récupération des projets :', error);
      }
    };

    fetchProjects();
  }, []);

  const handleTaskSubmit = async (taskData: {
    projectName: string;
    startDate: string;
    endDate: string;
    studyAmount: number;
    description: string;
  }) => {
    if (!userId) {
      setNotification({ message: 'Utilisateur non authentifié.', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/project/createProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          createdById: userId,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setNotification({ message: 'Projet créé avec succès.', type: 'success' });

        // Ajouter le nouveau projet à la liste des projets
        setProjects((prevProjects) => [
          ...prevProjects,
          {
            id: project.id, // Ajoutez l'ID ou un identifiant unique
            projectName: project.projectName,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            studyAmount: project.studyAmount || 0, // Si applicable
            status: project.status || 'Inconnu', // Par défaut si absent
            description: project.description || 'Non spécifiée', // Par défaut si absent
            createdAt: new Date(project.createdAt || Date.now()), // Si absent, utilisez la date actuelle
            createdById: project.createdById || null, // Par défaut null si non spécifié
            createdBy: project.createdBy || { id: 0, username: 'Inconnu' }, // Par défaut minimal
            realExpense: project.realExpense || 0, // Par défaut si absent
          },
        ]);
        
      } else {
        const error = await response.json();
        setNotification({ message: `Erreur : ${error.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Erreur réseau lors de la création du projet :', error);
      setNotification({ message: 'Erreur serveur lors de la création du projet.', type: 'error' });
    } finally {
      setShowPopup(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="container mx-auto p-2">
      {/* Bouton flottant en haut à droite */}
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-blue-500 text-white rounded-full p-2 shadow-lg"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus size={20} />
        </button>
      </div>

      {/* Afficher le calendrier Gantt */}
      <CalendarGanttChart projects={projects} />

      {/* Afficher le popup */}
      {showPopup && (
        <TaskPopup
          onClose={() => setShowPopup(false)}
          onSubmit={handleTaskSubmit}
        />
      )}

      {/* Notification Popup */}
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default TaskPage;
