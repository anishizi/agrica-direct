// File: pages/connection-history.tsx
import { useState, useEffect } from 'react';

interface ConnectionHistoryEntry {
  id: number;
  username: string;
  dateTime: string; // Reçu en tant que chaîne ISO
}

export default function ConnectionHistory() {
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/connection-history', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data: { history: ConnectionHistoryEntry[] } = await response.json();
          setHistory(data.history);
        }
      }
    };
    fetchHistory();
  }, []);

  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  const currentItems = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-semibold text-center mb-4">Historique de connexion</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">Nom utilisateur</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Heure</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((entry) => {
              const date = new Date(entry.dateTime);
              return (
                <tr key={entry.id} className="border-b text-gray-700">
                  <td className="px-4 py-2">{entry.username}</td>
                  <td className="px-4 py-2">{date.toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2">
                    {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                Aucun historique de connexion disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          &larr; Précédent
        </button>
        <span className="text-gray-700">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Suivant &rarr;
        </button>
      </div>
    </div>
  );
}
