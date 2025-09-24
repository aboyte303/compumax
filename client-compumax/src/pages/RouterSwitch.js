import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";

function RoutersSwitches() {
  const [routers, setRouters] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    id_sucursal: "",
    nombre: "",
    modelo: "",
    mac: "",
    sn: "",
    usuario: "",
    contrasena: "",
  });

  useEffect(() => {
    fetchRouters();
    fetchSucursales();
    fetchClientes();

    // Detectar si es móvil
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchRouters = async () => {
    const res = await api.get("/routerswitch");
    setRouters(res.data);
  };

  const fetchSucursales = async () => {
    const res = await api.get("/sucursales");
    setSucursales(res.data);
  };

  const fetchClientes = async () => {
    const res = await api.get("/clientes");
    setClientes(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await api.put(`/routerswitch/${formData.id}`, formData);
    } else {
      await api.post("/routerswitch", formData);
    }
    setFormData({
      id: null,
      id_sucursal: "",
      nombre: "",
      modelo: "",
      mac: "",
      sn: "",
      usuario: "",
      contrasena: "",
    });
    fetchRouters();
  };

  const handleEdit = (router) => {
    setFormData({
      id: router.id,
      id_sucursal: router.id_sucursal?.toString() || "",
      nombre: router.nombre,
      modelo: router.modelo,
      mac: router.mac,
      sn: router.sn,
      usuario: router.usuario,
      contrasena: router.contrasena,
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/routerswitch/${id}`);
    fetchRouters();
  };

  // Filtro y búsqueda
  const filteredRouters = routers.filter((r) => {
    const matchSearch =
      r.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      r.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      r.mac?.toLowerCase().includes(search.toLowerCase()) ||
      r.sn?.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre_cliente?.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre_sucursal?.toLowerCase().includes(search.toLowerCase());

    const matchCliente = filtroCliente ? r.id_cliente === parseInt(filtroCliente) : true;
    const matchSucursal = filtroSucursal ? r.id_sucursal === parseInt(filtroSucursal) : true;

    return matchSearch && matchCliente && matchSucursal;
  });

  // Columnas de la tabla (solo desktop)
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre_sucursal" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: "modelo" },
    { header: "MAC", accessor: "mac" },
    { header: "SN", accessor: "sn" },
    { header: "Usuario", accessor: "usuario" },
    { header: "Contraseña", accessor: "contrasena" },
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

  // Diccionario de etiquetas amigables para el modal
  const labels = {
    id: "ID",
    nombre_cliente: "Cliente",
    nombre_sucursal: "Sucursal",
    nombre: "Nombre",
    modelo: "Modelo",
    mac: "MAC",
    sn: "Serie (SN)",
    usuario: "Usuario",
    contrasena: "Contraseña",
    creado_por_nombre: "Creado por",
    actualizado_por_nombre: "Actualizado por",
  };

  return (
    <div>
      <h2>Routers / Switches</h2>

      {/* Buscador y filtros */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
          <option value="">Todos los clientes</option>
          {clientes.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {cl.nombre}
            </option>
          ))}
        </select>
        <select value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)}>
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <select
          name="id_sucursal"
          value={formData.id_sucursal}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione Sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre_cliente} - {s.nombre}
            </option>
          ))}
        </select>
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} />
        <input type="text" name="mac" placeholder="MAC" value={formData.mac} onChange={handleChange} />
        <input type="text" name="sn" placeholder="Serie (SN)" value={formData.sn} onChange={handleChange} />
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} />
        <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} />
        <button type="submit">{formData.id ? "Actualizar" : "Agregar"}</button>
      </form>

      {/* Tabla en desktop / Cards en móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredRouters} />
      ) : (
        <div>
          {filteredRouters.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                background: "#f9f9f9"
              }}
            >
              <h4>{r.nombre} ({r.modelo})</h4>
              <p><strong>Cliente:</strong> {r.nombre_cliente}</p>
              <p><strong>Sucursal:</strong> {r.nombre_sucursal}</p>

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleEdit(r)}>Editar</button>
                <button onClick={() => handleDelete(r.id)} style={{ marginLeft: "8px" }}>Eliminar</button>
                <button onClick={() => setSelectedRouter(r)} style={{ marginLeft: "8px" }}>Ver detalle</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle en móvil */}
      {selectedRouter && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setSelectedRouter(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "400px",
              width: "90%"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Detalle de router/switch</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(selectedRouter).map(([key, value]) => (
                <li key={key}><strong>{labels[key] || key}:</strong> {value ?? "-"}</li>
              ))}
            </ul>
            <button onClick={() => setSelectedRouter(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoutersSwitches;
