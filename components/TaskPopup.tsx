import React, { useState } from 'react';

interface TaskPopupProps {
  onClose: () => void;
  onSubmit: (taskData: {
    projectName: string;
    startDate: string;
    endDate: string;
    studyAmount: number;
    description: string;
  }) => void;
}

const TaskPopup: React.FC<TaskPopupProps> = ({ onClose, onSubmit }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [studyAmount, setStudyAmount] = useState<string>(''); // Formaté
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState({
    projectName: false,
    startDate: false,
    endDate: false,
    studyAmount: false,
    description: false,
  });

  // Formater le montant au format "0 000 000"
  const formatCurrency = (value: string): string =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const handleStudyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudyAmount(formatCurrency(e.target.value));
  };

  const validateInputs = () => {
    const newErrors = {
      projectName: projectName.trim() === '',
      startDate: startDate === '',
      endDate: endDate === '',
      studyAmount: studyAmount.trim() === '' || parseInt(studyAmount.replace(/\s/g, ''), 10) <= 0,
      description: description.trim() === '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      const numericAmount = parseInt(studyAmount.replace(/\s/g, ''), 10);
      onSubmit({
        projectName,
        startDate,
        endDate,
        studyAmount: numericAmount,
        description,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Créer une Tâche</h2>
        
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Nom de Projet</label>
          <input
            type="text"
            className={`w-full border rounded p-2 ${errors.projectName ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Ex : Project d'agriculture"
          />
          {errors.projectName && <p className="text-red-500 text-sm mt-1">Veuillez saisir un nom de projet.</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Date de Début</label>
          <input
            type="date"
            className={`w-full border rounded p-2 ${errors.startDate ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">Veuillez sélectionner une date de début.</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Date de Fin</label>
          <input
            type="date"
            className={`w-full border rounded p-2 ${errors.endDate ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">Veuillez sélectionner une date de fin.</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Somme d'Étude</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full border rounded p-2 pr-12 ${errors.studyAmount ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
              value={studyAmount}
              onChange={handleStudyAmountChange}
              placeholder="Ex : 5 000 000"
            />
            <span className="absolute right-4 top-2 text-gray-500">TND</span>
          </div>
          {errors.studyAmount && <p className="text-red-500 text-sm mt-1">Veuillez entrer une somme valide.</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Description</label>
          <textarea
            className={`w-full border rounded p-2 ${errors.description ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Description du projet"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">Veuillez ajouter une description.</p>}
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

export default TaskPopup;
