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
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-left font-semibold text-sm"
              >
                {col.header}
              </th>
            ))}
            <th className="px-4 py-2 text-left font-semibold text-sm">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-4 text-center text-gray-500 italic"
              >
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                {columns.map((col, cidx) => {
                  const value = col.render
                    ? col.render(row)
                    : getNestedValue(row, col.accessor);

                  return (
                    <td key={cidx} className="px-4 py-2 text-sm text-gray-800">
                      {value !== undefined && value !== null && value !== ""
                        ? value
                        : col.defaultValue ?? "-"}
                    </td>
                  );
                })}
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => setSelectedRow(row)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de detalle */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Detalles</h3>
            <ul className="space-y-2">
              {columns.map((col, i) => (
                <li key={i} className="text-sm">
                  <strong className="font-semibold">{col.header}:</strong>{" "}
                  {col.render
                    ? col.render(selectedRow)
                    : getNestedValue(selectedRow, col.accessor) ?? "-"}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponsiveTable;
