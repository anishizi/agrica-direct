import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
}

interface CreditCreationPopupProps {
  onClose: () => void;
  onSubmit: (creditData: any) => void;
}

const CreditCreationPopup: React.FC<CreditCreationPopupProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // Étape du processus de création du crédit
  const [amount, setAmount] = useState<number | ''>(''); // Montant initial
  const [duration, setDuration] = useState<number | ''>(''); // Durée en mois
  const [interestRate, setInterestRate] = useState<number | ''>(''); // Taux d'intérêt
  const [fees, setFees] = useState<number | ''>(''); // Frais de dossier
  const [startDate, setStartDate] = useState<string>(''); // Date de début (mois-année)
  const [participants, setParticipants] = useState<User[]>([]); // Liste des participants disponibles
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]); // IDs des participants sélectionnés
  const [participantError, setParticipantError] = useState(false); // Erreur si aucun participant sélectionné
  const [errors, setErrors] = useState({
    amount: false,
    duration: false,
    interestRate: false,
    fees: false,
    startDate: false,
  });

  useEffect(() => {
    // Fonction pour récupérer les utilisateurs disponibles (participants)
    const fetchUsers = async () => {
      const response = await fetch('/api/participants');
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    };
    fetchUsers();
  }, []);

  const validateStep1 = () => {
    // Validation de la première étape : tous les champs doivent être remplis
    const newErrors = {
      amount: amount === '',
      duration: duration === '',
      interestRate: interestRate === '',
      fees: fees === '',
      startDate: startDate === '',
    };
    setErrors(newErrors);

    return !Object.values(newErrors).includes(true);
  };

  const handleNextStep = () => {
    // Gère la transition entre les étapes
    if (step === 1) {
      if (validateStep1()) {
        setStep(step + 1);
      }
    } else if (step === 2) {
      if (selectedParticipants.length === 0) {
        setParticipantError(true);
      } else {
        setParticipantError(false);
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => setStep(step - 1);

  const handleToggleParticipant = (id: number) => {
    // Gère l'ajout et la suppression des participants sélectionnés
    setSelectedParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
    setParticipantError(false);
  };

  const calculateResults = () => {
    // Calcule les résultats basés sur les informations fournies
    const loanAmount = amount || 0;
    const monthlyInterestRate = (interestRate || 0) / 100 / 12;
    const loanDuration = duration || 1;
    const dossierFees = fees || 0;

    const monthlyPayment = parseFloat(
      (
        loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, loanDuration) /
        (Math.pow(1 + monthlyInterestRate, loanDuration) - 1)
      ).toFixed(2)
    );

    const totalDue = parseFloat((monthlyPayment * loanDuration + dossierFees).toFixed(2));
    const paymentPerParticipant = parseFloat(
      (monthlyPayment / (selectedParticipants.length || 1)).toFixed(2)
    );

    return { totalDue, monthlyPayment, paymentPerParticipant };
  };

  const formatDateToYearMonth = (date: string) => {
    // Formate la date pour qu'elle soit au format YYYY-MM
    const [year, month] = date.split('-');
    return `${year}-${month}`;
  };

  const handleSubmit = () => {
    // Fonction pour soumettre les données du crédit
    const result = calculateResults();
  
    const creditData = {
      baseAmount: parseFloat((amount || 0).toFixed(2)), // Montant initial
      totalAmount: parseFloat(result.totalDue.toFixed(2)), // Montant total arrondi
      monthlyPayment: parseFloat(result.monthlyPayment.toFixed(2)), // Échéance mensuelle arrondie
      duration, // Durée en mois
      interestRate: parseFloat((interestRate || 0).toFixed(2)), // Taux d'intérêt arrondi
      fees: parseFloat((fees || 0).toFixed(2)), // Frais arrondis
      startDate, // Date déjà au format "YYYY-MM"
      selectedParticipants, // Liste des participants
    };
  
    onSubmit(creditData); // Appel de la fonction passée en props
    onClose(); // Fermer le popup
  };

  const stepTitles = ["Crédit", "Participants", "Résultat"];
  const results = calculateResults();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          {stepTitles.map((title, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step > index ? 'bg-green-500 text-white' : step === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-xs mt-1">{title}</p>
              </div>
              {index < stepTitles.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Crédit */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Crédit</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Montant du crédit</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className={`w-full border rounded p-2 ${errors.amount ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
                value={amount === '' ? '' : amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex : 12000"
                min={1}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Durée en mois</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                className={`w-full border rounded p-2 ${errors.duration ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
                value={duration === '' ? '' : duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Ex : 12"
                min={1}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Intérêt en %</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                className={`w-full border rounded p-2 ${errors.interestRate ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
                value={interestRate === '' ? '' : interestRate}
                onChange={(e) => setInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex : 5"
                min={0}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Frais de dossier</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className={`w-full border rounded p-2 ${errors.fees ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
                value={fees === '' ? '' : fees}
                onChange={(e) => setFees(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex : 68.24"
                min={0}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Date de début</label>
              <input
                type="month"
                className={`w-full border rounded p-2 ${errors.startDate ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Sélectionnez le mois"
              />
            </div>
            <div className="flex justify-between mt-4">
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded" onClick={onClose}>
                Annuler
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleNextStep}>
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Participants */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            {participants.map((user) => (
              <div key={user.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedParticipants.includes(user.id)}
                  onChange={() => handleToggleParticipant(user.id)}
                />
                <label>{user.username}</label>
              </div>
            ))}
            {participantError && (
              <p className="text-red-500 text-sm mt-2">Veuillez sélectionner au moins un participant.</p>
            )}
            <div className="flex justify-between mt-4">
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded" onClick={handlePreviousStep}>
                Précédent
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleNextStep}>
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Résultat */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Résultat</h2>
            <div className="mb-4 border-b pb-4">
              <p className="text-gray-700"><strong>Montant du crédit :</strong> {amount} €</p>
              <p className="text-gray-700"><strong>Durée :</strong> {duration} mois</p>
              <p className="text-gray-700"><strong>Intérêt :</strong> {interestRate} %</p>
              <p className="text-gray-700"><strong>Frais de dossier :</strong> {fees} €</p>
              <p className="text-gray-700"><strong>Date de début :</strong> {formatDateToYearMonth(startDate)}</p>
            </div>
            <div className="mb-4 border-b pb-4">
              <p className="text-gray-700"><strong>Montant total du crédit :</strong> {results.totalDue.toFixed(2)} €</p>
              <p className="text-gray-700"><strong>Échéance par mois :</strong> {results.monthlyPayment.toFixed(2)} €</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700"><strong>Liste des participants :</strong></p>
              <ul className="list-disc ml-5 text-gray-700">
                {selectedParticipants.map((id) => (
                  <li key={id}>{participants.find((user) => user.id === id)?.username}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-2"><strong>Échéance par participant :</strong> {results.paymentPerParticipant.toFixed(2)} €</p>
            </div>
            <div className="flex justify-between mt-4">
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded" onClick={handlePreviousStep}>
                Précédent
              </button>
              <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleSubmit}>
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCreationPopup;
