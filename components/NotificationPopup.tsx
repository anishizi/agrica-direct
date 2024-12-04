import React from 'react';

interface NotificationPopupProps {
  message: string;
  type: 'success' | 'error'; // Type de notification pour gérer l'apparence
  onClose: () => void;
  onRefetch?: () => void; // Fonction pour refetcher les API
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, type, onClose, onRefetch }) => {
  const handleClose = () => {
    if (onRefetch) {
      onRefetch(); // Appelle la fonction de refetch si elle est définie
    }
    onClose(); // Ferme la popup
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-sm ${type === 'error' ? 'border-red-500' : 'border-green-500'} border-2`}>
        <h2 className={`text-xl font-semibold mb-4 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {type === 'error' ? 'Erreur' : 'Succès'}
        </h2>
        <p className="text-gray-700">{message}</p>
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            onClick={handleClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
