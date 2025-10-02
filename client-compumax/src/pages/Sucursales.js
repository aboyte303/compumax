import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import EntityCard from "../components/EntityCard";
import useIsMobile from "../hooks/useIsMobile";

function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [formData, setFormData] = useState({
    id: null,
    id_cliente: "",
    nombre: "",
  });

  const [search, setSearch] = useState("");
  const [filterCliente, setFilterCliente] = useState("");

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSucursales();
    fetchClientes();
  }, []);

  const fetchSucursales = async () => {
    try {
      const res = await api.get("/sucursales");
      setSucursales(res.data);
    } catch (err) {
      console.error("Error al obtener sucursales:", err);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_cliente || !formData.nombre.trim()) {
      alert("Completa todos los campos");
      return;
    }

    try {
      if (formData.id) {
        await api.put(`/sucursales/${formData.id}`, {
          id_cliente: formData.id_cliente,
          nombre: formData.nombre,
        });
      } else {
        await api.post("/sucursales", {
          id_cliente: formData.id_cliente,
          nombre: formData.nombre,
        });
      }

      setFormData({ id: null, id_cliente: "", nombre: "" });
      fetchSucursales();
    } catch (err) {
      console.error("Error al guardar sucursal:", err);
    }
  };

  const handleEdit = (sucursal) => {
    setFormData({
      id: sucursal.id,
      id_cliente: sucursal.id_cliente,
      nombre: sucursal.nombre,
    });
  };

  const handleCancel = () => {
    setFormData({ id: null, id_cliente: "", nombre: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta sucursal?")) return;
    try {
      await api.delete(`/sucursales/${id}`);
      fetchSucursales();
    } catch (err) {
      console.error("Error al eliminar sucursal:", err);
    }
  };

  // 🔎 Filtros
  const filteredSucursales = useMemo(() => {
    return sucursales.filter((s) => {
      const matchSearch =
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.nombre_cliente?.toLowerCase().includes(search.toLowerCase());

      const matchCliente =
        filterCliente === "" || s.id_cliente?.toString() === filterCliente;

      return matchSearch && matchCliente;
    });
  }, [sucursales, search, filterCliente]);

  // 📋 Columnas
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre" },
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

  // 📱 Tarjetas
  const cardFields = [
    { label: "Cliente", accessor: "nombre_cliente" },
    { label: "Sucursal", accessor: "nombre" },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Sucursales</h1>

      {/* 🔎 Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar sucursal o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg flex-1"
        />
        <select
          value={filterCliente}
          onChange={(e) => setFilterCliente(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-600">
          {filteredSucursales.length} de {sucursales.length}
        </span>
      </div>

      {/* 📝 Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow"
      >
        <select
          name="id_cliente"
          value={formData.id_cliente}
          onChange={handleChange}
          required
          className="p-2 border rounded-lg"
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          placeholder="Nombre de la sucursal"
          onChange={handleChange}
          required
          className="p-2 border rounded-lg"
        />

        <div className="flex gap-2 col-span-full">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {formData.id ? "Actualizar" : "Agregar"}
          </button>
          {formData.id && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* 💻 Tabla / 📱 Cards */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredSucursales} />
      ) : (
        <div className="space-y-4">
          {filteredSucursales.map((s) => (
            <EntityCard
              key={s.id}
              item={s}
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

export default Sucursales;
