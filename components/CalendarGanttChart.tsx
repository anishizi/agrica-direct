import React, { useState, useEffect } from 'react';
import { Project } from '../types/Project';
import {
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval,
  eachDayOfInterval,
  addYears,
  subYears,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';



const COULEURS = [
  '#81C784', // Vert un peu plus foncé
  '#90CAF9', // Bleu clair légèrement plus foncé
  '#FFB74D', // Orange moyen clair
  '#CE93D8', // Violet moyen
  '#E57373', // Rouge clair plus soutenu
  '#F06292', // Rose moyen
  '#4DD0E1', // Cyan moyen clair
  '#FFF176', // Jaune doux
  '#AED581', // Vert moyen
  '#B39DDB', // Violet clair soutenu
  '#9FA8DA', // Bleu-gris clair soutenu
  '#BCAAA4', // Brun moyen clair
  '#B0BEC5', // Bleu-gris moyen clair
  '#80CBC4', // Turquoise moyen clair
];


const obtenirCouleurTexte = (backgroundColor: string) => {
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);
  const luminosité = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminosité > 0.5 ? 'text-black' : 'text-white';
};
interface CalendarGanttChartProps {
  projects: Project[];
}
const CalendarGanttChart: React.FC<CalendarGanttChartProps> = ({ projects }) => {

  const [dateActuelle, setDateActuelle] = useState(new Date());
  const [modeVue, setModeVue] = useState<'année' | 'mois' | 'semaine'>('année');
  const [localProjects, setLocalProjects] = useState<Project[]>([]);


  const [dayIntervalStep, setDayIntervalStep] = useState(1);
  const [detailsVisibility, setDetailsVisibility] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project/getProjects', {
          method: 'GET',
        });
    
        if (response.ok) {
          const data = await response.json();
          const formattedProjects = await Promise.all(
            data.map(async (project: any) => {
              // Récupérer les dépenses pour chaque projet
              const expensesResponse = await fetch(
                `/api/expenses/getByProject?projectId=${project.id}`
              );
              const expenses = expensesResponse.ok ? await expensesResponse.json() : [];
              const totalExpense = expenses.reduce(
                (sum: number, expense: any) => sum + expense.total,
                0
              );
    
              return {
                ...project,
                startDate: new Date(project.startDate),
                endDate: new Date(project.endDate),
                createdAt: new Date(project.createdAt),
                createdBy: project.createdBy?.username || 'Inconnu',
                realExpense: totalExpense, // Ajout de la dépense réelle
              };
            })
          );
    
          setLocalProjects(formattedProjects);

        } else {
          console.error('Erreur lors de la récupération des projets');
        }
      } catch (error) {
        console.error('Erreur réseau lors de la récupération des projets :', error);
      }
    };
    

    fetchProjects();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const largeurEcran = window.innerWidth;
      if (modeVue === 'mois') {
        if (largeurEcran > 768) {
          setDayIntervalStep(1);
        } else if (largeurEcran > 500) {
          setDayIntervalStep(2);
        } else if (largeurEcran > 400) {
          setDayIntervalStep(3);
        } else {
          setDayIntervalStep(4);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [modeVue]);

  const handlePrecedent = () => {
    if (modeVue === 'année') {
      setDateActuelle((prev) => subYears(prev, 1));
    } else if (modeVue === 'mois') {
      setDateActuelle((prev) => subMonths(prev, 1));
    } else if (modeVue === 'semaine') {
      setDateActuelle((prev) => subWeeks(prev, 1));
    }
  };

  const handleSuivant = () => {
    if (modeVue === 'année') {
      setDateActuelle((prev) => addYears(prev, 1));
    } else if (modeVue === 'mois') {
      setDateActuelle((prev) => addMonths(prev, 1));
    } else if (modeVue === 'semaine') {
      setDateActuelle((prev) => addWeeks(prev, 1));
    }
  };

  const debutAnnee = startOfYear(dateActuelle);
  const finAnnee = endOfYear(dateActuelle);
  const debutMois = startOfMonth(dateActuelle);
  const finMois = endOfMonth(dateActuelle);
  const debutSemaine = startOfWeek(dateActuelle, { weekStartsOn: 1 });
  const finSemaine = endOfWeek(dateActuelle, { weekStartsOn: 1 });

  const obtenirIntervalles = () => {
    if (modeVue === 'année') {
      return eachMonthOfInterval({ start: debutAnnee, end: finAnnee }).map((date) =>
        format(date, 'MMM', { locale: fr }).replace('.', '')
      );
    }
    if (modeVue === 'mois') {
      return eachDayOfInterval({ start: debutMois, end: finMois })
        .map((date) => format(date, 'dd', { locale: fr }))
        .filter((_, index) => index % dayIntervalStep === 0);
    }
    if (modeVue === 'semaine') {
      return eachDayOfInterval({ start: debutSemaine, end: finSemaine }).map((date) =>
        format(date, 'EEE', { locale: fr }).replace('.', '')
      );
    }
    return [];
  };

  const obtenirStyleProjet = (
    project: Project,
    intervalStart: Date,
    intervalEnd: Date,
    projectIndex: number
  ) => {
    const projectStart = Math.max(project.startDate.getTime(), intervalStart.getTime());
    const projectEnd = Math.min(project.endDate.getTime(), intervalEnd.getTime());

    if (projectStart > intervalEnd.getTime() || projectEnd < intervalStart.getTime()) {
      return null;
    }

    const totalIntervalDays = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60 * 60 * 24);
    const projectStartOffset =
      ((projectStart - intervalStart.getTime()) / (1000 * 60 * 60 * 24)) * 100 / totalIntervalDays;
    const projectDuration =
      ((projectEnd - projectStart) / (1000 * 60 * 60 * 24)) * 100 / totalIntervalDays;

    const backgroundColor = COULEURS[projectIndex % COULEURS.length];
    const textColorClass = obtenirCouleurTexte(backgroundColor);

    return {
      left: `${projectStartOffset}%`,
      width: `${projectDuration}%`,
      backgroundColor: backgroundColor,
      border: `2px solid ${backgroundColor}`,
      borderRadius: '5px',
      height: '30px',
      position: 'absolute' as 'absolute',
      display: 'grid',
      placeItems: 'center',
      color: textColorClass === 'text-black' ? 'black' : 'white',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'clip',
      direction: 'ltr' as 'ltr',
    };
  };

  const intervalStart =
    modeVue === 'année' ? debutAnnee : modeVue === 'mois' ? debutMois : debutSemaine;
  const intervalEnd = modeVue === 'année' ? finAnnee : modeVue === 'mois' ? finMois : finSemaine;

  

  const obtenirLibellePeriode = () => {
    if (modeVue === 'année') {
      return `${format(debutAnnee, 'yyyy', { locale: fr })}`;
    } else if (modeVue === 'mois') {
      return `${format(debutMois, 'MMMM yyyy', { locale: fr })}`;
    } else if (modeVue === 'semaine') {
      return `Semaine du ${format(debutSemaine, 'dd MMM yyyy', { locale: fr })} au ${format(
        finSemaine,
        'dd MMM yyyy',
        { locale: fr }
      )}`;
    }
  };

  
  
  const handleDetailClick = (projectId: number) => {
    window.location.href = `/depense?projectId=${projectId}`;
};


const projetsFiltres = localProjects.filter((project) => {
  return (
    project.startDate <= intervalEnd && project.endDate >= intervalStart
  );
});

  const formatterTND = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} TND`; // Format en français avec séparateurs d'espaces
  };
  

  return (
    <div className="mt-2">
      {/* Date actuelle */}
      <div className="text-center text-lg font-bold text-gray-700 mb-2">
        <button
          onClick={() => setDateActuelle(new Date())} // Réinitialise à la date actuelle
          className="bg-green-500 text-white text-sm py-2 px-4 rounded-md hover:bg-green-600"
        >
          Date du jour: {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
        </button>
      </div>
      <div className="flex justify-around">
        <button
          onClick={handlePrecedent}
          className="bg-blue-500 text-white text-sm py-2 px-2 rounded-md flex items-center hover:bg-blue-600"
        >
          <AiOutlineLeft className="mr-1" />
        </button>
        <button
          onClick={() => setModeVue('semaine')}
          className={`${
            modeVue === 'semaine' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
          } text-sm py-2 px-2 rounded-md hover:bg-blue-600`}
        >
          Semaine
        </button>
        <button
          onClick={() => setModeVue('mois')}
          className={`${
            modeVue === 'mois' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
          } text-sm py-2 px-4 rounded-md hover:bg-blue-600`}
        >
          Mois
        </button>
        <button
          onClick={() => setModeVue('année')}
          className={`${
            modeVue === 'année' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
          } text-sm py-2 px-4 rounded-md hover:bg-blue-600`}
        >
          Année
        </button>
        <button
          onClick={handleSuivant}
          className="bg-blue-500 text-white text-sm py-2 px-2 rounded-md flex items-center hover:bg-blue-600"
        >
          <AiOutlineRight className="ml-1" />
        </button>
      </div>

      <h2 className="text-center text-lg font-semibold text-blue-600">{obtenirLibellePeriode()}</h2>

      <div className="relative bg-white border rounded-lg shadow-lg p-2">
        {/* En-têtes des intervalles */}
        <div className="flex justify-between text-xs text-gray-600 mb-2 relative">
          {obtenirIntervalles().map((interval, index) => (
            <div
              key={index}
              className="flex-1 flex justify-center items-center border-l border-gray-300 text-center"
              style={{ height: '2rem' }} // Hauteur des en-têtes
            >
              {interval}
            </div>
          ))}
          {/* Ligne horizontale pour les en-têtes */}
          <div className="absolute left-0 right-0 top-full border-t border-gray-300"></div>
        </div>

        {/* Tableau contenant les projets */}
        <div className="relative">
          {/* Lignes horizontales pour les projets */}
          {Array.from({ length: projetsFiltres.length }).map((_, rowIndex) => (
            <div
              key={`horizontal-line-${rowIndex}`}
              className="absolute left-0 right-0 border-t border-gray-300"
              style={{ top: `${(rowIndex + 1) * 2}rem` }} // Espacement en fonction des rangées
            ></div>
          ))}

          {/* Lignes verticales pour les intervalles */}
          <div className="absolute top-0 left-0 right-0 h-full pointer-events-none flex">
            {obtenirIntervalles().map((_, colIndex) => (
              <div
                key={`vertical-line-${colIndex}`}
                className="border-l border-gray-300"
                style={{ flex: '1' }} // Divise l'espace entre les colonnes
              ></div>
            ))}
          </div>

          {/* Projets */}
          {projetsFiltres.map((project, index) => {
            const style = obtenirStyleProjet(project, intervalStart, intervalEnd, index);

            return (
              <div key={index} className="relative w-full h-8 flex items-center">
                {style && (
                  <div
                    className="absolute text-xs text-center font-semibold"
                    style={style}
                    title={`${project.projectName}: ${format(
                      project.startDate,
                      'dd MMM yyyy',
                      { locale: fr }
                    )} - ${format(project.endDate, 'dd MMM yyyy', { locale: fr })}`}
                  >
                    {project.projectName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des projets avec détails */}
<div className="mt-4">
  <h3 className="text-lg font-bold text-gray-700 mb-2">Projets</h3>
  {projetsFiltres.map((project, index) => {
    const projectStartDate = format(project.startDate, 'dd MMM yyyy', { locale: fr });
    const projectEndDate = format(project.endDate, 'dd MMM yyyy', { locale: fr });
    const backgroundColor = COULEURS[index % COULEURS.length];
    const textColorClass = obtenirCouleurTexte(backgroundColor);

    return (
      <div
        key={index}
        className="relative border border-gray-300 rounded-lg p-3 mb-3 shadow-sm transition-all duration-200"
        style={{ backgroundColor }}
      >
        {/* Titre et bouton */}
        <div className="flex justify-between items-center">
          <div className={`text-base font-semibold truncate ${textColorClass}`}>
            {project.projectName}
          </div>
          <button
            className="text-sm rounded-full bg-white border-2 border-gray-300 w-7 h-7 flex items-center justify-center hover:bg-gray-200"
            onClick={() =>
              setDetailsVisibility({ [index]: !detailsVisibility[index] }) // Un seul projet peut être étendu
            }
          >
            {detailsVisibility[index] ? '-' : '+'}
          </button>
        </div>

        {/* Dates */}
        <div className={`text-xs mt-1 ${textColorClass}`}>
          {projectStartDate} - {projectEndDate}
        </div>

      {/* Détails du projet (mode étendu) */}
{detailsVisibility[index] && (
  <div className="mt-3 bg-gray-50 p-3 rounded-lg">
    <p className="text-sm">
      <span className="font-semibold">Somme d'étude :</span>{' '}
      {formatterTND(project.studyAmount || 0)}
    </p>
    {/* Dépense réelle */}
    <p className="text-sm">
      <span className="font-semibold">Dépense réelle :</span>{' '}
      {formatterTND(project.realExpense || 0)}{' '}
      <button
        onClick={() => handleDetailClick(project.id)}
        className="text-blue-500 hover:text-blue-700"
      >
        Détails
      </button>
    </p>
    <p className="font-semibold">
      <span className="text-black">Statut : </span>
      <span
        className={`${
          project.status === 'En cours'
            ? 'text-orange-600'
            : project.status === 'Terminé'
            ? 'text-green-600'
            : project.status === 'Annulé'
            ? 'text-red-600'
            : 'text-black'
        }`}
      >
        {project.status}
      </span>
    </p>

    {/* Description avec gestion d'overflow */}
    <p className="text-sm mt-1 max-w-full overflow-hidden text-ellipsis">
      <span className="font-semibold">Description :</span>{' '}
      {project.description || 'Non spécifiée'}
    </p>

    {/* Création du projet avec date et auteur */}
    <p className="text-sm mt-1 max-w-full overflow-hidden text-ellipsis">
      <span className="font-semibold">Créé par :</span>{' '}
      {typeof project.createdBy === 'string'
        ? project.createdBy
        : project.createdBy?.username || 'Inconnu'}
      , le{' '}
      {format(new Date(project.createdAt || ''), 'dd MMM yyyy', { locale: fr })}
    </p>
  </div>
)}

      </div>
    );
  })}
</div>

    </div>
  );
};

export default CalendarGanttChart;
