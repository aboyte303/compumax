import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import EntityCard from "../components/EntityCard";
import useIsMobile from "../hooks/useIsMobile";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({ id: null, nombre: "" });

  // filtros/orden
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return alert("El nombre no puede estar vacío");

    try {
      if (formData.id) {
        await api.put(`/clientes/${formData.id}`, { nombre: formData.nombre });
      } else {
        await api.post("/clientes", { nombre: formData.nombre });
      }
      setFormData({ id: null, nombre: "" });
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({ id: cliente.id, nombre: cliente.nombre });
  };

  const handleCancel = () => {
    setFormData({ id: null, nombre: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  //Buscar + ordenar
  const filteredClientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = clientes.filter((c) =>
      (c.nombre || "").toLowerCase().includes(q)
    );

    switch (sort) {
      case "az":
        arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "za":
        arr.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case "idAsc":
        arr.sort((a, b) => a.id - b.id);
        break;
      case "idDesc":
        arr.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    return arr;
  }, [clientes, query, sort]);

  // columnas (desktop)
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
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
  const cardFields = [{ label: "Nombre", accessor: "nombre" }];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Clientes</h1>

      {/* filtros */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          margin: "10px 0 20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="az">Nombre A–Z</option>
          <option value="za">Nombre Z–A</option>
          <option value="idAsc">ID ascendente</option>
          <option value="idDesc">ID descendente</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setSort("az");
          }}
        >
          Limpiar
        </button>
        <span style={{ opacity: 0.8 }}>
          {filteredClientes.length} de {clientes.length}
        </span>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          placeholder="Nombre del cliente"
          onChange={handleChange}
          required
        />
        <button type="submit">
          {formData.id ? "Actualizar Cliente" : "Agregar Cliente"}
        </button>
        {formData.id && (
          <button type="button" onClick={handleCancel}>
            Cancelar
          </button>
        )}
      </form>

      {/* vista responsiva */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredClientes} />
      ) : (
        <div>
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
