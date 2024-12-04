import React, { useState } from 'react';

interface SoldePopupProps {
  onClose: () => void;
  onSubmit: (soldeData: { amount: number; source: string; addedAt: string }) => void;
}

const SoldePopup: React.FC<SoldePopupProps> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState<string>(''); // Montant sous forme de chaîne pour le formatage
  const [source, setSource] = useState<string>(''); // Source
  const [addedAt, setAddedAt] = useState<string>(''); // Date d'ajout
  const [errors, setErrors] = useState({
    amount: false,
    source: false,
    addedAt: false,
  });

  // Fonction pour formater l'entrée au format "0 000 000"
  const formatCurrency = (value: string): string => {
    return value.replace(/\D/g, '') // Supprime tout sauf les chiffres
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Ajoute des espaces entre les milliers
  };

  // Gestionnaire de changement pour le champ montant
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value; // Récupère la valeur brute entrée par l'utilisateur
    const formattedValue = formatCurrency(rawValue); // Formate la valeur
    setAmount(formattedValue); // Met à jour l'état avec la valeur formatée
  };

  const validateInputs = () => {
    const newErrors = {
      amount: amount.trim() === '' || parseInt(amount.replace(/\s/g, ''), 10) <= 0,
      source: source.trim() === '',
      addedAt: addedAt === '',
    };
    setErrors(newErrors);

    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      // Convertir le montant formaté en nombre avant de soumettre
      const numericAmount = parseInt(amount.replace(/\s/g, ''), 10);
      onSubmit({
        amount: numericAmount,
        source,
        addedAt,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Créer un Solde</h2>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Montant</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full border rounded p-2 pr-12 ${
                errors.amount ? 'bg-red-100 border-red-500' : 'border-gray-300'
              }`}
              value={amount}
              onChange={handleAmountChange}
              placeholder="Ex : 12 000"
            />
            <span className="absolute right-4 top-2 text-gray-500">TND</span>
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">Veuillez saisir un montant valide.</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Source</label>
          <input
            type="text"
            className={`w-full border rounded p-2 ${
              errors.source ? 'bg-red-100 border-red-500' : 'border-gray-300'
            }`}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex : Salaire, Épargne, etc."
          />
          {errors.source && (
            <p className="text-red-500 text-sm mt-1">Veuillez indiquer la source.</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Date d'ajout</label>
          <input
            type="date"
            className={`w-full border rounded p-2 ${
              errors.addedAt ? 'bg-red-100 border-red-500' : 'border-gray-300'
            }`}
            value={addedAt}
            onChange={(e) => setAddedAt(e.target.value)}
          />
          {errors.addedAt && (
            <p className="text-red-500 text-sm mt-1">Veuillez sélectionner une date.</p>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all"
            onClick={handleSubmit}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoldePopup;
