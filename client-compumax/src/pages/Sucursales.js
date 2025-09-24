import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import EntityCard from "../components/EntityCard";
import useIsMobile from "../hooks/useIsMobile";

function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);

  // formulario
  const [formData, setFormData] = useState({
    id: null,
    id_cliente: "",
    nombre: "",
  });

  // filtros
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

  //filtros: búsqueda + cliente
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

  // columnas para la tabla
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre" },
    {
      header: "Acciones",
      accessor: "acciones",
      render: (row) => (
        <>
          <button onClick={() => handleEdit(row)}>Editar</button>
          <button onClick={() => handleDelete(row.id)}>Eliminar</button>
        </>
      ),
    },
  ];

  // campos de tarjeta
  const cardFields = [
    { label: "Cliente", accessor: "nombre_cliente" },
    { label: "Sucursal", accessor: "nombre" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sucursales</h1>

      {/* filtros */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar sucursal o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterCliente}
          onChange={(e) => setFilterCliente(e.target.value)}
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <span style={{ opacity: 0.7 }}>
          {filteredSucursales.length} de {sucursales.length}
        </span>
      </div>

      {/* formulario */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "15px" }}>
        <select
          name="id_cliente"
          value={formData.id_cliente}
          onChange={handleChange}
          required
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
        />
        <button type="submit">
          {formData.id ? "Actualizar" : "Agregar"}
        </button>
        {formData.id && (
          <button type="button" onClick={handleCancel}>
            Cancelar
          </button>
        )}
      </form>

      {/* vista responsiva */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredSucursales} />
      ) : (
        <div>
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
