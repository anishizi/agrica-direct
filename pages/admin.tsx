import { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationPopup from '../components/NotificationPopup'; // Importez votre NotificationPopup

interface User {
  id: number; // Conformément au schéma Prisma
  username: string;
  email?: string;
  status: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]); // Typage explicite des utilisateurs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null); // ID de l'utilisateur à supprimer
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    // Récupérer tous les utilisateurs lors du chargement de la page
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        setNotification({
          message: 'Erreur lors de la récupération des utilisateurs.',
          type: 'error',
        });
      }
    };
    fetchUsers();
  }, []);

  // Générer une question mathématique pour la confirmation
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathQuestion({ question: `${num1} + ${num2}`, answer: num1 + num2 });
    setUserAnswer('');
  };

  // Ouvrir la fenêtre de confirmation pour un utilisateur donné
  const confirmDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    generateMathQuestion();
    setShowConfirmModal(true);
  };

  // Supprimer un utilisateur
  const deleteUser = async () => {
    if (parseInt(userAnswer, 10) !== mathQuestion.answer) {
      setNotification({
        message: 'Réponse incorrecte. Veuillez réessayer.',
        type: 'error',
      });
      return;
    }

    try {
      await axios.post('/api/admin/delete', { userId: userToDelete });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
      setNotification({
        message: 'Utilisateur supprimé avec succès.',
        type: 'success',
      });
      setShowConfirmModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur :', error);
      setNotification({
        message: 'Erreur lors de la suppression de l’utilisateur.',
        type: 'error',
      });
    }
  };

  // Mettre à jour le statut d'un utilisateur
  const updateUserStatus = async (userId: number, newStatus: string) => {
    try {
      await axios.patch('/api/admin/users', { userId, newStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      setNotification({
        message: `Statut mis à jour : ${newStatus}.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      setNotification({
        message: 'Erreur lors de la mise à jour du statut.',
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Gestion des utilisateurs</h1>

      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nom d'utilisateur</th>
            <th className="py-2 px-4 border-b">Statut</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.username}</td>
              <td className="py-2 px-4 border-b">{user.status}</td>
              <td className="py-2 px-4 border-b">
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  {user.status !== 'Confirmer' && (
                    <button
                      className="bg-green-500 text-white py-2 px-3 rounded w-full md:w-auto"
                      onClick={() => updateUserStatus(user.id, 'Confirmer')}
                    >
                      Confirmer
                    </button>
                  )}
                  {user.status !== 'Rejecter' && (
                    <button
                      className="bg-red-500 text-white py-2 px-3 rounded w-full md:w-auto"
                      onClick={() => updateUserStatus(user.id, 'Rejecter')}
                    >
                      Rejeter
                    </button>
                  )}
                  <button
                    className="bg-gray-500 text-white py-2 px-3 rounded w-full md:w-auto"
                    onClick={() => confirmDeleteUser(user.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirmer la suppression</h2>
            <p className="mb-4">Résolvez cette question pour confirmer :</p>
            <p className="font-bold mb-2">{mathQuestion.question} = ?</p>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
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

export default AdminPage;
