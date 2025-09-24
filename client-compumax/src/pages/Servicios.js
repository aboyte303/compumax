import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import useIsMobile from "../hooks/useIsMobile";
import EntityCard from "../components/EntityCard";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSucursal, setFilterSucursal] = useState("");
  const [form, setForm] = useState({
    id_sucursal: "",
    nombre: "",
    descripcion: "",
    fecha: "",
  });
  const [editId, setEditId] = useState(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchServicios();
    fetchSucursales();
  }, []);

  const fetchServicios = async () => {
    try {
      const res = await api.get("/servicios");
      setServicios(res.data);
    } catch (err) {
      console.error("Error al obtener servicios:", err);
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await api.get("/sucursales");
      setSucursales(res.data);
    } catch (err) {
      console.error("Error al obtener sucursales:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/servicios/${editId}`, form);
      } else {
        await api.post("/servicios", form);
      }
      setForm({ id_sucursal: "", nombre: "", descripcion: "", fecha: "" });
      setEditId(null);
      fetchServicios();
    } catch (err) {
      console.error("Error al guardar servicio:", err);
    }
  };

  const handleEdit = (servicio) => {
    setForm({
      id_sucursal: servicio.id_sucursal?.toString() || "",
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      fecha: servicio.fecha ? servicio.fecha.split("T")[0] : "",
    });
    setEditId(servicio.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/servicios/${id}`);
      fetchServicios();
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
    }
  };

  // 🔍 Filtrado búsqueda + sucursal
  const filteredServicios = servicios.filter((s) => {
    const matchSearch =
      s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(search.toLowerCase());

    const matchSucursal =
      filterSucursal === "" || s.id_sucursal?.toString() === filterSucursal;

    return matchSearch && matchSucursal;
  });

  // 📊 Columnas tabla escritorio
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre_sucursal" },
    { header: "Servicio", accessor: "nombre" },
    { header: "Descripción", accessor: "descripcion" },
    {
      header: "Fecha",
      accessor: "fecha",
      render: (row) => row.fecha?.split("T")[0] || "",
    },
    { header: "Creado por", accessor: "creado_por_nombre" },
    { header: "Actualizado por", accessor: "actualizado_por_nombre" },
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

  // 📱 Campos que se muestran en EntityCard (móvil)
  const cardFields = [
    { label: "Cliente", accessor: "nombre_cliente" },
    { label: "Sucursal", accessor: "nombre_sucursal" },
    { label: "Servicio", accessor: "nombre" },
    { label: "Descripción", accessor: "descripcion" },
    { label: "Fecha", accessor: "fecha", render: (val) => val?.split("T")[0] },
  ];

  return (
    <div>
      <h2>Servicios</h2>

      {/* 🔍 Buscador + filtro sucursal */}
      <div>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterSucursal}
          onChange={(e) => setFilterSucursal(e.target.value)}
        >
          <option value="">Todas las Sucursales</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre_cliente} - {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* 📝 Formulario */}
      <form onSubmit={handleSubmit}>
        <select
          name="id_sucursal"
          value={form.id_sucursal}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre_cliente} - {s.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre del servicio"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
        />

        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
      </form>

      {/* 📊 Vista escritorio vs 📱 móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredServicios} />
      ) : (
        <div>
          {filteredServicios.map((s) => (
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

export default Servicios;
