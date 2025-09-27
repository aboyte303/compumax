import React from "react";
import Button from "./Button";

function EntityCard({ item, fields, onEdit, onDelete, onDetail }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200">
      {/* Encabezado con título principal */}
      <h4 className="text-lg font-semibold text-gray-800 mb-2">
        {item.nombre || "Sin nombre"}
      </h4>

      {/* Campos dinámicos */}
      <ul className="text-sm text-gray-600 space-y-1">
        {fields.map((f, idx) => (
          <li key={idx}>
            <span className="font-medium">{f.label}:</span>{" "}
            {item[f.accessor] ?? "-"}
          </li>
        ))}
      </ul>

      {/* Acciones */}
      <div className="flex gap-2 mt-4">
        {onDetail && (
          <Button variant="primary" onClick={() => onDetail(item)}>
            Ver más
          </Button>
        )}
        {onEdit && (
          <Button variant="warning" onClick={() => onEdit(item)}>
            Editar
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(item.id)}>
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}

export default EntityCard;
