import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CreditCirclesProps {
  creditData: any; // Données du crédit (passées depuis CreditPage)
  selectedMonthYear: string; // Mois et année sélectionnés
  payments: any[]; // Paiements récupérés depuis Prisma
  userId: number; // ID de l'utilisateur connecté
}

const CreditCircles: React.FC<CreditCirclesProps> = ({ creditData, selectedMonthYear, payments, userId }) => {
  // Vérifier si 'payments' est défini avant d'utiliser 'filter'
  if (!payments || payments.length === 0) {
    return <div>Chargement des paiements...</div>;
  }

  // Trouver l'échéance spécifique à l'utilisateur connecté pour le mois sélectionné
  const userPayments = payments.filter(
    (payment) => payment.userId === userId // Filtrer par utilisateur connecté
  );

  // Récupérer le montant de l'échéance de l'utilisateur pour le mois sélectionné
  const installmentAmount = userPayments
    .filter((payment) => {
      const dueDate = new Date(payment.dueDate);
      const monthYear = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return monthYear === selectedMonthYear; // Filtrer par mois sélectionné
    })
    .map((payment) => payment.amount)[0] || 0; // Si trouvé, récupérer le montant de l'échéance, sinon utiliser 0

  // Nombre total de participants pour le mois sélectionné (nombre de paiements pour ce mois)
  const totalParticipants = payments.filter((payment) => {
    const dueDate = new Date(payment.dueDate);
    const monthYear = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return monthYear === selectedMonthYear;
  }).length;

  // Nombre de participants ayant payé pour le mois sélectionné
  const paidParticipants = payments.filter((payment) => {
    const dueDate = new Date(payment.dueDate);
    const monthYear = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return monthYear === selectedMonthYear && payment.status === 'Payé'; // Vérifier si le statut est "Payé"
  }).length;

  // Calculer le montant total payé : `installmentAmount` * nombre de personnes payées
  const totalPaidAmount = installmentAmount * paidParticipants;

  // Calcul de la progression de la durée du crédit (0/totalDurée)
  const totalDuration = creditData.durationMonths || 1; // Durée totale du crédit
  const monthsPassed = Math.min(
    Math.floor((new Date().getTime() - new Date(creditData.startDate).getTime()) / (1000 * 3600 * 24 * 30)),
    totalDuration
  ); // Mois passés depuis la date de début du crédit

  // Calcul de la progression du deuxième cercle (payé / total participants)
  const progressPaidParticipants = totalParticipants === 0 ? 0 : (paidParticipants / totalParticipants) * 100; // Calcul de la progression

  return (
    <div className="flex flex-col space-y-4">
      {/* Premier cercle - Progression de la durée du crédit */}
      <div className="flex items-start space-x-4">
        <div style={{ width: '120px', height: '120px' }}>
          <CircularProgressbar
            value={monthsPassed}
            maxValue={totalDuration}
            text={`${monthsPassed}/${totalDuration}`}
            styles={buildStyles({
              pathColor: '#007BFF', // Couleur bleue pour le cercle
              textColor: '#333',
              trailColor: '#e6e6e6',
            })}
          />
        </div>
        <div className="flex flex-col items-start">
          {/* Montant du crédit avec un cercle bleu devant */}
          <div className="flex items-center text-left">
            <div className="w-3 h-3 rounded-full bg-[#007BFF] mr-2"></div> {/* Cercle bleu */}
            <p className="text-[#007BFF] text-lg font-bold">
              <span style={{ fontSize: '30px' }}>{creditData.amount}</span> € {/* Affichage du montant */}
            </p>
          </div>
          <div className="space-y-2">
            {/* Taux d'intérêt sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Taux d'intérêt: <span className="font-bold">{creditData.interestRate} %</span></p>
            </div>
            {/* Durée sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Durée: <span className="font-bold">{creditData.durationMonths} mois</span></p>
            </div>
            {/* Montant total sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Montant total: <span className="font-bold">{creditData.totalAmount} €</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième cercle - Participants payés */}
      <div className="flex items-start space-x-4">
        <div style={{ width: '120px', height: '120px' }}>
          <CircularProgressbar
            value={progressPaidParticipants} // Progrès des participants ayant payé
            maxValue={100} // Maximum de 100% de participants payés
            text={`${paidParticipants}/${totalParticipants}`}
            styles={buildStyles({
              pathColor: '#4CAF50', // Couleur verte pour le cercle
              textColor: '#333',
              trailColor: '#e6e6e6',
            })}
          />
        </div>
        <div className="flex flex-col items-start">
          {/* Montant de l'échéance avec un cercle vert devant */}
          <div className="flex items-center text-left">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></div> {/* Cercle vert */}
            <p className="text-[#4CAF50] text-lg font-bold">
              <span style={{ fontSize: '30px' }}>
                {installmentAmount.toFixed(2)} {/* Affichage du montant de l'échéance */}
              </span> €
            </p>
          </div>
          <div className="space-y-2">
            {/* Mensualité Crédit sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Mensualité Crédit: <span className="font-bold">{creditData.monthlyPayment.toFixed(2)} €</span></p>
            </div>
            {/* Mois sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Mois: <span className="font-bold">{new Date(`${selectedMonthYear}-01`).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span></p>
            </div>
            {/* Montant total payé sans cercle */}
            <div className="flex items-center text-left">
              <p className="text-gray-600 text-sm">Montant total payé: <span className="font-bold">{totalPaidAmount.toFixed(2)} €</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCircles;
