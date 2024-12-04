import React, { useState, useEffect } from 'react';
import MathFormulaPopup from '../components/MathFormulaPopup';
import NotificationPopup from '../components/NotificationPopup';

interface Project {
  id: number;
  projectName: string;
  startDate: string;
  endDate: string;
  studyAmount: number;
  status: string;
  description: string;
}

const ProjectSelector: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMathPopup, setShowMathPopup] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project/getProjects');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des projets');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Erreur réseau lors de la récupération des projets :', error);
      }
    };

    fetchProjects();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    const project = projects.find((proj) => String(proj.id) === projectId);
    setSelectedProject(project || null);
    setIsEditing(false); // Réinitialise l'état d'édition
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/project/deleteProject?id=${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la suppression :', errorText);
        setNotification({
          message: `Erreur lors de la suppression : ${response.statusText}`,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      setNotification({ message: data.message, type: 'success' });
      setProjects((prev) => prev.filter((proj) => proj.id !== selectedProject.id));
      setSelectedProject(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet :', error);
      setNotification({ message: 'Erreur serveur.', type: 'error' });
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch('/api/project/updateProject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la mise à jour :', errorText);
        setNotification({
          message: `Erreur lors de la mise à jour : ${response.statusText}`,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      setNotification({ message: data.message, type: 'success' });
      setIsEditing(false);
      setProjects((prev) =>
        prev.map((proj) => (proj.id === selectedProject.id ? selectedProject : proj))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet :', error);
      setNotification({ message: 'Erreur serveur.', type: 'error' });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">GESTION DES TACHES</h1>

      {/* Liste déroulante */}
      <div className="mb-6">
        <label htmlFor="project-select" className="block mb-2 text-sm font-medium">
          Choisissez un projet :
        </label>
        <select
          id="project-select"
          className="w-full p-2 border rounded"
          onChange={handleSelectChange}
          defaultValue=""
        >
          <option value="">-- Sélectionnez un projet --</option>
          {projects.map((project) => (
            <option key={project.id} value={String(project.id)}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage des détails du projet sélectionné */}
      {selectedProject ? (
        <div className="bg-gray-100 p-4 rounded shadow">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Nom du Projet</label>
            <input
              type="text"
              value={selectedProject.projectName}
              onChange={(e) =>
                setSelectedProject((prev) =>
                  prev ? { ...prev, projectName: e.target.value } : prev
                )
              }
              className={`w-full border rounded p-2 ${
                isEditing ? '' : 'bg-gray-100'
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Date de Début</label>
            <input
              type="date"
              value={selectedProject.startDate.slice(0, 10)}
              onChange={(e) =>
                setSelectedProject((prev) =>
                  prev ? { ...prev, startDate: e.target.value } : prev
                )
              }
              className={`w-full border rounded p-2 ${
                isEditing ? '' : 'bg-gray-100'
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Date de Fin</label>
            <input
              type="date"
              value={selectedProject.endDate.slice(0, 10)}
              onChange={(e) =>
                setSelectedProject((prev) =>
                  prev ? { ...prev, endDate: e.target.value } : prev
                )
              }
              className={`w-full border rounded p-2 ${
                isEditing ? '' : 'bg-gray-100'
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Montant de l'Étude (TND)</label>
            <input
              type="text"
              value={selectedProject.studyAmount.toLocaleString('fr-FR')}
              onChange={(e) =>
                setSelectedProject((prev) =>
                  prev
                    ? { ...prev, studyAmount: parseFloat(e.target.value.replace(/\s/g, '')) }
                    : prev
                )
              }
              className={`w-full border rounded p-2 ${
                isEditing ? '' : 'bg-gray-100'
              }`}
              readOnly={!isEditing}
            />
          </div>
          <div className="mb-4">
  <label className="block mb-2 text-sm font-medium">Statut</label>
  <select
    value={selectedProject?.status || ''}
    onChange={(e) =>
      setSelectedProject((prev) =>
        prev ? { ...prev, status: e.target.value } : prev
      )
    }
    className={`w-full border rounded p-2 ${
      isEditing ? '' : 'bg-gray-100'
    }`}
    disabled={!isEditing}
  >
    <option value="En cours">En cours</option>
    <option value="Terminé">Terminé</option>
    <option value="Annulé">Annulé</option>
  </select>
</div>


          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea
              value={selectedProject.description}
              onChange={(e) =>
                setSelectedProject((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              className={`w-full border rounded p-2 ${
                isEditing ? '' : 'bg-gray-100'
              }`}
              rows={4}
              readOnly={!isEditing}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              className={`${
                isEditing ? 'bg-green-500' : 'bg-blue-500'
              } text-white py-2 px-4 rounded hover:${
                isEditing ? 'bg-green-600' : 'bg-blue-600'
              } transition-all`}
              onClick={() => (isEditing ? handleUpdateProject() : setIsEditing(true))}
            >
              {isEditing ? 'Confirmer' : 'Modifier'}
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-all"
              onClick={() => setShowMathPopup(true)}
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Aucun projet sélectionné.</p>
      )}

      {/* Popup Mathématique */}
      {showMathPopup && (
        <MathFormulaPopup
          onClose={() => setShowMathPopup(false)}
          onConfirm={() => {
            setShowMathPopup(false);
            handleDeleteProject();
          }}
        />
      )}

      {/* Notification Popup */}
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ProjectSelector;
