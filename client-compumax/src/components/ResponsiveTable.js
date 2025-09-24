import React, { useState } from "react";

function getNestedValue(obj, accessor) {
  if (typeof accessor === "function") {
    try {
      return accessor(obj);
    } catch {
      return undefined;
    }
  }

  if (typeof accessor === "string") {
    return accessor
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  return undefined;
}

function ResponsiveTable({ columns, data }) {
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <div className="responsive-table-container">
      <table className="responsive-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
            <th className="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: "center", opacity: 0.7 }}>
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col, cidx) => {
                  const value = col.render
                    ? col.render(row)
                    : getNestedValue(row, col.accessor);

                  return (
                    <td key={cidx} data-label={col.header}>
                      {value !== undefined && value !== null && value !== ""
                        ? value
                        : col.defaultValue ?? "-"}
                    </td>
                  );
                })}
                <td>
                  <button onClick={() => setSelectedRow(row)}>Ver detalle</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de detalle */}
      {selectedRow && (
        <div className="modal-overlay" onClick={() => setSelectedRow(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Detalles</h3>
            <ul>
              {columns.map((col, i) => (
                <li key={i}>
                  <strong>{col.header}:</strong>{" "}
                  {col.render
                    ? col.render(selectedRow)
                    : getNestedValue(selectedRow, col.accessor) ?? "-"}
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedRow(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <style>{`
        .responsive-table {
          width: 100%;
          border-collapse: collapse;
        }
        .responsive-table th, 
        .responsive-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .actions-col {
          width: 100px;
        }

        @media (max-width: 768px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table, 
          .responsive-table tbody, 
          .responsive-table tr, 
          .responsive-table td {
            display: block;
            width: 100%;
          }
          .responsive-table tr {
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
          }
          .responsive-table td {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .responsive-table td::before {
            content: attr(data-label);
            font-weight: bold;
          }
          .actions-col {
            display: none; /* ocultar encabezado de acciones en móvil */
          }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          max-width: 400px;
          width: 90%;
        }
        .modal-content h3 {
          margin-top: 0;
        }
        .modal-content ul {
          list-style: none;
          padding: 0;
        }
        .modal-content li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export default ResponsiveTable;
