import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import useIsMobile from "../hooks/useIsMobile";
import EntityCard from "../components/EntityCard";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "" });
  const [editId, setEditId] = useState(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/clientes/${editId}`, form);
      } else {
        await api.post("/clientes", form);
      }
      setForm({ nombre: "", contacto: "", telefono: "" });
      setEditId(null);
      fetchClientes();
    } catch (err) {
      console.error("Error al guardar cliente:", err);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      nombre: cliente.nombre,
    });
    setEditId(cliente.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      fetchClientes();
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
    }
  };


  const filteredClientes = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  //Columnas tabla
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
    {
      header: "Acciones",
      accessor: "acciones",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  // Tarjetas móvil
  const cardFields = [
    { label: "Nombre", accessor: "nombre" },
  ];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>

      {/*Buscador */}
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-lg"
      />

      {/*Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="p-2 border rounded-lg"
        />

        <button
          type="submit"
          className="col-span-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {editId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/*Tabla /Tarjetas */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredClientes} />
      ) : (
        <div className="space-y-4">
          {filteredClientes.map((c) => (
            <EntityCard
              key={c.id}
              item={c}
              fields={cardFields}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Clientes;
