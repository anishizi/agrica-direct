import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaHome, FaCreditCard, FaCheckSquare, FaDollarSign, FaChartPie } from 'react-icons/fa';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null); 
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    return nameParts.length === 1
      ? nameParts[0].slice(0, 2).toUpperCase()
      : nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setUserEmail(data.email);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const menuItems = [
    { icon: <FaHome />, label: 'Home', href: '/' },
    { icon: <FaCreditCard />, label: 'Credit', href: '/credit' },
    { icon: <FaCheckSquare />, label: 'Tâches', href: '/tasks' },
    { icon: <FaDollarSign />, label: 'Dépenses', href: '/depense' },
    { icon: <FaChartPie />, label: 'Solde', href: '/solde' },
  ];

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Votre contenu ici */}
      </div>

      {/* Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-16 flex items-center justify-around rounded-t-3xl shadow-lg border-t border-gray-200 px-4 z-50">
        {menuItems.map((item, index) => {
          const isActive = router.pathname === item.href;

          return (
            <Link
              href={item.href}
              key={index}
              className="relative flex flex-col items-center cursor-pointer"
              style={{ flex: 1, textAlign: 'center' }}
              title={item.label}
            >
              {isActive && (
                <div className="absolute -top-6 w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-transform transform scale-110">
                  <span className="text-blue-600 text-xl">{item.icon}</span>
                </div>
              )}
              <span
                className={`text-xl transition duration-300 ${isActive ? 'text-transparent' : 'text-gray-400 hover:text-blue-500'}`}
              >
                {item.icon}
              </span>
              <span
                className={`text-xs font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'} mt-1`}
              >
                {item.label.toLowerCase()}
              </span>
            </Link>
          );
        })}

        {/* User Badge */}
        {username && (
          <div className="relative flex items-center justify-center cursor-pointer" ref={menuRef}>
            <div
              className="relative w-12 h-12 bg-blue-500 text-white font-semibold text-sm flex items-center justify-center rounded-full shadow-md ml-2"
              onClick={() => setShowMenu(!showMenu)}
            >
              {getInitials(username)} {/* Affiche les initiales de l'utilisateur */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* Backdrop and Popup Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-20 z-10" onClick={() => setShowMenu(false)}></div>

                <div className="absolute bottom-20 right-2 z-20 bg-white rounded-lg shadow-lg p-4 w-48 text-center border border-gray-200 transition-transform duration-300">
                  <p className="text-gray-700 font-semibold text-base mb-4">{username}</p>
                  <button
                    className="w-full mb-2 bg-blue-500 text-white font-medium text-base py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    onClick={() => {
                      setShowMenu(false);
                      router.push('/connection-history');
                    }}
                  >
                    Historique de connexion
                  </button>

                  {(userEmail === 'anishizi44@gmail.com' || userEmail === 'soufiene.hizi@hotmail.com') && (
  <>
    <button
      className="w-full mb-2 bg-gray-400 text-white font-medium text-base py-2 rounded-lg hover:bg-gray-500 transition duration-300"
      onClick={() => {
        setShowMenu(false);
        router.push('/admin');
      }}
    >
      Admin
    </button>

    <button
      className="w-full mb-2 bg-green-400 text-white font-medium text-base py-2 rounded-lg hover:bg-green-600 transition duration-300"
      onClick={() => {
        setShowMenu(false);
        router.push('/gestiontask');
      }}
    >
      Gestion des Tâches
    </button>

    <button
      className="w-full mb-2 bg-blue-400 text-white font-medium text-base py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      onClick={() => {
        setShowMenu(false);
        router.push('/gestiondepenses'); // Redirection vers la nouvelle page
      }}
    >
      Gestion des Dépenses
    </button>
  </>
)}



                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white font-medium text-base py-2 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
