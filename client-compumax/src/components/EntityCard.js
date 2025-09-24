import React from "react";

function EntityCard({ item, fields, onEdit, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        background: "#f9f9f9",
      }}
    >
      <h4>{item.nombre || item.modelo || `ID ${item.id}`}</h4>
      {fields.map((f) => (
        <p key={f.accessor}>
          <strong>{f.label}:</strong> {item[f.accessor] ?? "-"}
        </p>
      ))}

      <div style={{ marginTop: "10px" }}>
        {onEdit && <button onClick={() => onEdit(item)}>✏️ Editar</button>}
        {onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            style={{ marginLeft: "8px" }}
          >
            🗑 Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

export default EntityCard;
