import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CreditCreationPopup from '../components/CreditCreationPopup';
import NotificationPopup from '../components/NotificationPopup';
import CreditCircles from '../components/CreditCircles';
import MathFormulaPopup from '../components/MathFormulaPopup';
import { FaPlus } from 'react-icons/fa';

const CreditPage: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [showMathPopup, setShowMathPopup] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);
  const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [otherParticipantsPayments, setOtherParticipantsPayments] = useState<Payment[]>([]);
  
  const router = useRouter();

  // Interface pour les paiements
interface Payment {
  id: number;
  userId: number;
  amount: number;
  status: string;
  dueDate: string;
  user: { username: string }; // Informations de l'utilisateur pour le paiement
}

// Interface pour les crédits
interface Credit {
  id: number;
  amount: number;
  paymentDates: string[];
  payments: Payment[];
}

// Fonction pour obtenir l'année et le mois actuels au format "YYYY-MM"
const getCurrentMonthYear = (): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
  // Fonction pour récupérer les données utilisateur depuis un token
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/user', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUserId(data.id);
          } else {
            setNotification({ message: 'Erreur lors de la récupération des données utilisateur.', type: 'error' });
            router.push('/login');
          }
        } catch (error) {
          setNotification({ message: 'Erreur réseau lors de la récupération des données utilisateur.', type: 'error' });
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };
    fetchUserData();
  }, [router]);

  // Fonction pour récupérer les crédits associés à l'utilisateur
  useEffect(() => {
    if (userId) {
      const fetchCredits = async () => {
        try {
          const response = await fetch(`/api/credits/getByUser?userId=${userId}`);
          if (!response.ok) throw new Error('Erreur lors de la récupération des crédits.');

          const data: Credit[] = await response.json();
          const sortedCredits = data.sort((a, b) => a.id - b.id);
          setCredits(sortedCredits);

          if (sortedCredits.length > 0) {
            const firstCredit = sortedCredits[0];
            setSelectedCreditId(firstCredit.id);

            const currentMonth = getCurrentMonthYear();
            const paymentDates = firstCredit.paymentDates;

            if (paymentDates.includes(currentMonth)) {
              setSelectedDueDate(currentMonth);
              filterPaymentsForDate(currentMonth, firstCredit);
            } else {
              setSelectedDueDate(paymentDates[0]);
              filterPaymentsForDate(paymentDates[0], firstCredit);
            }
          }
        } catch (error) {
          setNotification({ message: 'Erreur réseau lors de la récupération des crédits.', type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchCredits();
    }
  }, [userId]);

  // Filter payments for a selected due date
  const handleDueDateChange = (date: string) => {
    setSelectedDueDate(date);
    const selectedCredit = credits.find((credit) => credit.id === selectedCreditId);
    if (selectedCredit) {
      filterPaymentsForDate(date, selectedCredit);
      filterOtherParticipantsPayments(selectedCredit, date);
    }
  };

  const filterPaymentsForDate = (date: string, credit: any) => {
    const paymentsForDate = credit?.payments.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate);
      const selectedDate = new Date(date);

      return (
        paymentDate.getFullYear() === selectedDate.getFullYear() &&
        paymentDate.getMonth() === selectedDate.getMonth() &&
        payment.userId === userId
      );
    });

    setFilteredPayments(paymentsForDate || []);
    filterAllParticipantsPayments(credit, date);
  };

  const filterAllParticipantsPayments = (credit: any, date: string) => {
    const allPaymentsForDate = credit?.payments.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate);
      const selectedDate = new Date(date);

      return (
        paymentDate.getFullYear() === selectedDate.getFullYear() &&
        paymentDate.getMonth() === selectedDate.getMonth() &&
        payment.userId !== userId
      );
    });

    setOtherParticipantsPayments(allPaymentsForDate || []);
  };

  const filterOtherParticipantsPayments = (credit: any, date: string) => {
    const otherPaymentsForDate = credit?.payments.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate);
      const selectedDate = new Date(date);

      return (
        paymentDate.getFullYear() === selectedDate.getFullYear() &&
        paymentDate.getMonth() === selectedDate.getMonth() &&
        payment.userId !== userId
      );
    });

    setOtherParticipantsPayments(otherPaymentsForDate || []);
  };

  

  const formatMonthYear = (date: string) => {
    const paymentDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' }; // Correction ici
    return paymentDate.toLocaleDateString('fr-FR', options);
  };
  

  // Handle payment status change
  const handlePaymentStatusChange = (paymentId: number) => {
    setPendingPaymentId(paymentId);
    setShowMathPopup(true);
  };

  const refreshCredits = async () => {
    try {
      const response = await fetch(`/api/credits/getByUser?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
  
        const validCredits = data.filter((credit: Credit) => credit !== null && credit.amount !== null);
        const sortedCredits = validCredits.sort((a: Credit, b: Credit) => a.id - b.id);
        setCredits(sortedCredits);
  
        if (selectedCreditId) {
          const selectedCredit = sortedCredits.find((credit: Credit) => credit.id === selectedCreditId); // Correction ici
          if (selectedCredit) {
            const currentMonth = getCurrentMonthYear();
            const paymentDates = selectedCredit.paymentDates;
  
            if (paymentDates.includes(currentMonth)) {
              setSelectedDueDate(currentMonth);
              filterPaymentsForDate(currentMonth, selectedCredit);
            } else {
              setSelectedDueDate(paymentDates[0]);
              filterPaymentsForDate(paymentDates[0], selectedCredit);
            }
          }
        }
      } else {
        setNotification({ message: 'Erreur lors de la récupération des crédits.', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Erreur réseau lors de la récupération des crédits.', type: 'error' });
    }
  };
  
  
  const confirmPayment = async () => {
    try {
      const response = await fetch('/api/payments/updateStatus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: pendingPaymentId }),
      });
  
      if (response.ok) {
        setNotification({ message: 'Paiement marqué comme payé.', type: 'success' });
  
        // Recharger les crédits après la mise à jour du paiement
        await refreshCredits();
      } else {
        const data = await response.json();
        setNotification({ message: `Erreur lors de la mise à jour du paiement: ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Erreur réseau lors de la mise à jour du paiement.', type: 'error' });
    } finally {
      setPendingPaymentId(null);
      setShowMathPopup(false);
    }
  };
  

  // Handle credit creation
  const handleCreditCreation = async (creditData: any) => {
    try {
      const response = await fetch('/api/credits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creditData, userId }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setNotification({ message: 'Crédit créé avec succès.', type: 'success' });
  
        // Recharger les crédits après la création d'un nouveau crédit
        await refreshCredits();
      } else {
        setNotification({ message: `Erreur lors de la création du crédit: ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Erreur réseau lors de la création du crédit.', type: 'error' });
    } finally {
      setShowPopup(false);
    }
  };
  

  if (loading) {
    return <p>Chargement des crédits...</p>;
  }

  const selectedCredit = credits.find((credit) => credit.id === selectedCreditId);

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="fixed top-2 right-2 z-50">
        <button
          className="bg-blue-500 text-white rounded-full p-2 shadow-lg"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus size={20} />
        </button>
      </div>

      {credits.length === 0 ? (
        <div className="container">
               <p className="text-gray-700">Pas de crédit enregistré à votre nom. Commencez par en ajouter un.</p>
             </div>
                 ) : (
             <div className="container">
                <label htmlFor="credit-select" className="block mb-2 font-medium">Sélectionner un crédit</label>
                 <select
                 id="credit-select"
                 className="py-2 px-4 border rounded w-full"
                 onChange={(e) => {
                    const creditId = Number(e.target.value);
                    setSelectedCreditId(creditId);
                    const selectedCredit = credits.find((c) => c.id === creditId);
                    if (selectedCredit) {
                    const paymentDates = selectedCredit.paymentDates;
                    const currentMonth = getCurrentMonthYear();
                    if (paymentDates.includes(currentMonth)) {
                        setSelectedDueDate(currentMonth);
                        filterPaymentsForDate(currentMonth, selectedCredit);
                    } else {
                        setSelectedDueDate(paymentDates[0]);
                        filterPaymentsForDate(paymentDates[0], selectedCredit);
                    }
                    }
                }}
                value={selectedCreditId ?? ''}
                >
  {credits.map((credit) => (
    <option key={credit.id} value={credit.id}>
      Crédit - {(credit.amount && !isNaN(credit.amount) ? credit.amount.toFixed(2) : '0.00')} €
    </option>
  ))}
</select>

          {selectedCredit && (
            <div className="mt-2">
              <CreditCircles
                creditData={selectedCredit}
                selectedMonthYear={selectedDueDate || getCurrentMonthYear()}
                payments={selectedCredit.payments}
                userId={userId!}
              />
            </div>
          )}

          <div className="mt-2">
            
            <select
              id="due-date-select"
              className="py-2 px-4 border rounded w-full"
              onChange={(e) => handleDueDateChange(e.target.value)}
              value={selectedDueDate ?? ''}
            >
              
              {selectedCredit?.paymentDates.map((date: string) => (
                <option key={date} value={date}>{formatMonthYear(date)}</option>
              ))}
            </select>
          </div>

          {filteredPayments.length > 0 && (
            <div className="mt-2">
             
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border border-gray-200 px-4 py-2">Nom</th>
                      
                      <th className="border border-gray-200 px-4 py-2">Statut</th>
                      <th className="border border-gray-200 px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="border border-gray-200 px-4 py-2">{payment.user.username}</td>
                        
                        <td
                          className={`border border-gray-200 px-4 py-2 font-semibold ${
                            payment.status === 'Non payé' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {payment.status}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          {payment.status === 'Non payé' && (
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded"
                              onClick={() => handlePaymentStatusChange(payment.id)}
                            >
                              Marquer comme payé
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {otherParticipantsPayments.length > 0 && (
            <div className="mt-2">
              <h4 className="block mb-2 font-medium">Autres participants :</h4>
              <div className="overflow-hidden  border border-gray-200">
                <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border border-gray-200 px-4 py-2">Nom</th>
                      <th className="border border-gray-200 px-4 py-2">Montant (€)</th>
                      <th className="border border-gray-200 px-4 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherParticipantsPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="border border-gray-200 px-4 py-2">{payment.user.username}</td>
                        <td className="border border-gray-200 px-4 py-2">{payment.amount}</td>
                        <td
                          className={`border border-gray-200 px-4 py-2 font-semibold ${
                            payment.status === 'Non payé' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showPopup && (
        <CreditCreationPopup onClose={() => setShowPopup(false)} onSubmit={handleCreditCreation} />
      )}

      {showMathPopup && (
        <MathFormulaPopup
          onClose={() => setShowMathPopup(false)}
          onConfirm={confirmPayment}
        />
      )}

      {notification.type && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: null })}
        />
      )}
    </div>
  );
};

export default CreditPage;
