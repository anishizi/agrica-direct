import React, { useState } from 'react';

interface MathFormulaPopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

const MathFormulaPopup: React.FC<MathFormulaPopupProps> = ({ onClose, onConfirm }) => {
  // Générer deux nombres aléatoires pour la formule
  const [number1] = useState<number>(Math.floor(Math.random() * 10) + 1);
  const [number2] = useState<number>(Math.floor(Math.random() * 10) + 1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Vérifier si la réponse est correcte
  const handleConfirm = () => {
    const correctAnswer = number1 + number2;
    if (parseInt(userAnswer) === correctAnswer) {
      onConfirm(); // Appeler la fonction de confirmation
    } else {
      setError('Réponse incorrecte. Veuillez réessayer.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Confirmer le Paiement</h2>
        <p className="mb-4">Résolvez cette formule pour confirmer le paiement :</p>
        <p className="text-blue-600 font-mono text-center text-2xl mb-4">
          {number1} + {number2} = ?
        </p>
        <input
          type="text"
          placeholder="Votre réponse"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleConfirm}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathFormulaPopup;
