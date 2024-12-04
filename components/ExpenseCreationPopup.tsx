import React, { useState, useEffect } from "react";

interface Project {
  id: number;
  projectName: string;
}

interface ExpenseCreationPopupProps {
  onClose: () => void;
  onSubmit: (expenseData: any) => void;
}


const ExpenseCreationPopup: React.FC<ExpenseCreationPopupProps> = ({
  onClose,
  onSubmit,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const [description, setDescription] = useState<string>(""); // Description
  const [unitPrice, setUnitPrice] = useState<string>(""); // Prix unitaire formaté
  const [quantity, setQuantity] = useState<number | "">("");
  const [errors, setErrors] = useState({
    selectedProjectId: false,
    description: false,
    unitPrice: false,
    quantity: false,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/getProjects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error("Erreur lors de la récupération des projets");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };
    fetchProjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInvoiceFile(file);
  };
  

  // Fonction pour formater les nombres au format "0 000 000"
  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/\s/g, ""); // Supprime les espaces existants
    const numeric = parseInt(numericValue, 10);
    return isNaN(numeric) ? "" : numeric.toLocaleString("fr-FR"); // Formate au style "fr-FR"
  };

  // Fonction pour convertir la chaîne formatée en valeur brute
  const parseCurrencyInput = (value: string): number => {
    return parseInt(value.replace(/\s/g, ""), 10) || 0; // Supprime les espaces et convertit en nombre
  };

  // Gestion de la saisie pour Prix unitaire
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, ""); // Supprime tout sauf les chiffres
    const formattedValue = formatCurrencyInput(rawValue); // Formate en "0 000 000"
    setUnitPrice(formattedValue);
  };

  // Gestion de la description limitée à 50 caractères
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 30); // Limite à 30 caractères
    setDescription(value);
  
    // Validation en direct pour mise à jour des erreurs
    if (value.trim().length === 0 || value.trim().length > 30) {
      setErrors((prev) => ({ ...prev, description: true }));
    } else {
      setErrors((prev) => ({ ...prev, description: false }));
    }
  };
  
  const validateFields = () => {
    const newErrors = {
      selectedProjectId: selectedProjectId === null,
      description: description.trim().length < 1 || description.trim().length > 30,
      unitPrice: unitPrice === "" || parseCurrencyInput(unitPrice) <= 0,
      quantity: quantity === "" || quantity <= 0,
    };
    setErrors(newErrors);
  
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = () => {
    if (validateFields()) {
      const numericUnitPrice = parseCurrencyInput(unitPrice);
      const totalAmount = numericUnitPrice * Number(quantity);
  
      const formData = new FormData();
      formData.append("projectId", String(selectedProjectId));
      formData.append("description", description.trim());
      formData.append("unitPrice", numericUnitPrice.toString());
      formData.append("quantity", quantity.toString());
      formData.append("total", totalAmount.toString());
  
      if (invoiceFile) {
        formData.append("invoiceFile", invoiceFile); // Inclure le fichier si présent
      }
  
      console.log("Data sent to backend:", {
        projectId: selectedProjectId,
        description: description.trim(),
        unitPrice: numericUnitPrice,
        quantity: quantity,
        total: totalAmount,
      });
  
      onSubmit(formData);
      onClose();
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Ajouter une Dépense</h2>

        {/* Sélection du projet */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Projet</label>
          <select
            className={`w-full border rounded p-2 ${
              errors.selectedProjectId ? "bg-red-100 border-red-500" : "border-gray-300"
            }`}
            onChange={(e) =>
              setSelectedProjectId(Number(e.target.value) || null)
            }
            value={selectedProjectId ?? ""}
          >
            <option value="">-- Sélectionnez un projet --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
          {errors.selectedProjectId && (
            <p className="text-red-500 text-sm mt-2">
              Veuillez sélectionner un projet.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
  <label className="block mb-2 text-gray-700">Description</label>
  <input
    type="text"
    className={`w-full border rounded p-2 ${
      errors.description ? "bg-red-100 border-red-500" : "border-gray-300"
    }`}
    value={description}
    onChange={handleDescriptionChange}
    placeholder="Entrez une description (1-30 caractères)"
  />
  {errors.description && (
    <p className="text-red-500 text-sm mt-2">
      La description est obligatoire (1-30 caractères).
    </p>
  )}
</div>


        {/* Saisie du prix unitaire */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Prix unitaire (TND)</label>
          <input
            type="text"
            inputMode="numeric"
            className={`w-full border rounded p-2 ${
              errors.unitPrice ? "bg-red-100 border-red-500" : "border-gray-300"
            }`}
            value={unitPrice}
            onChange={handleUnitPriceChange}
            placeholder="Ex : 1 000 000"
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-sm mt-2">
              Veuillez renseigner un prix unitaire valide.
            </p>
          )}
        </div>

        {/* Saisie de la quantité */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Quantité</label>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            className={`w-full border rounded p-2 ${
              errors.quantity ? "bg-red-100 border-red-500" : "border-gray-300"
            }`}
            value={quantity === "" ? "" : quantity}
            onChange={(e) =>
              setQuantity(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Ex : 10"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-2">
              Veuillez renseigner une quantité valide.
            </p>
          )}
        </div>
        <div className="mb-4">
  <label className="block mb-2 text-gray-700">Facture (PDF ou image)</label>
  <input
    type="file"
    accept=".pdf, image/*"
    className="w-full border rounded p-2 border-gray-300"
    onChange={handleFileChange}
  />
</div>


        {/* Total */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Total</label>
          <input
            type="text"
            className="w-full border rounded p-2 bg-gray-100"
            value={
              unitPrice && quantity
                ? `${formatCurrencyInput(
                    String(parseCurrencyInput(unitPrice) * Number(quantity))
                  )} TND`
                : "0 TND"
            }
            readOnly
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCreationPopup;
