import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";

function RadiosAntenas() {
  const [radios, setRadios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    id_sucursal: "",
    nombre: "",
    modelo: "",
    mac: "",
    sn: "",
    usuario: "",
    contrasena: "",
    tipo: "",
    ssid: "",
    ssid_psw: "",
    ip_cliente: "",
  });

  useEffect(() => {
    fetchRadios();
    fetchSucursales();
    fetchClientes();

    // Detectar si es móvil
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchRadios = async () => {
    const res = await api.get("/radios_antenas");
    setRadios(res.data);
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
      await api.put(`/radios_antenas/${formData.id}`, formData);
    } else {
      await api.post("/radios_antenas", formData);
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
      tipo: "",
      ssid: "",
      ssid_psw: "",
      ip_cliente: "",
    });
    fetchRadios();
  };

  const handleEdit = (radio) => {
    setFormData({
      id: radio.id,
      id_sucursal: radio.id_sucursal?.toString() || "",
      nombre: radio.nombre,
      modelo: radio.modelo,
      mac: radio.mac,
      sn: radio.sn,
      usuario: radio.usuario,
      contrasena: radio.contrasena,
      tipo: radio.tipo,
      ssid: radio.ssid,
      ssid_psw: radio.ssid_psw,
      ip_cliente: radio.ip_cliente,
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/radios_antenas/${id}`);
    fetchRadios();
  };

  // Filtro y búsqueda
  const filteredRadios = radios.filter((r) => {
    const matchSearch =
      r.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      r.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      r.mac?.toLowerCase().includes(search.toLowerCase()) ||
      r.sn?.toLowerCase().includes(search.toLowerCase()) ||
      r.ip_cliente?.toLowerCase().includes(search.toLowerCase()) ||
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
    { header: "Tipo", accessor: "tipo" },
    { header: "SSID", accessor: "ssid" },
    { header: "SSID Contraseña", accessor: "ssid_psw" },
    { header: "IP Cliente", accessor: "ip_cliente" },
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
    tipo: "Tipo",
    ssid: "SSID",
    ssid_psw: "SSID Contraseña",
    ip_cliente: "IP Cliente",
    creado_por_nombre: "Creado por",
    actualizado_por_nombre: "Actualizado por",
  };

  return (
    <div>
      <h2>Radios / Antenas</h2>

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
        <input type="text" name="tipo" placeholder="Tipo" value={formData.tipo} onChange={handleChange} />
        <input type="text" name="ssid" placeholder="SSID" value={formData.ssid} onChange={handleChange} />
        <input type="text" name="ssid_psw" placeholder="SSID Contraseña" value={formData.ssid_psw} onChange={handleChange} />
        <input type="text" name="ip_cliente" placeholder="IP Cliente" value={formData.ip_cliente} onChange={handleChange} />
        <button type="submit">{formData.id ? "Actualizar" : "Agregar"}</button>
      </form>

      {/* Tabla en desktop / Cards en móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredRadios} />
      ) : (
        <div>
          {filteredRadios.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "12px",
                background: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              <h4 style={{ marginBottom: "5px" }}>{r.nombre}</h4>
              <p style={{ margin: "2px 0" }}><strong>Modelo:</strong> {r.modelo}</p>
              <p style={{ margin: "2px 0" }}><strong>Cliente:</strong> {r.nombre_cliente}</p>
              <p style={{ margin: "2px 0" }}><strong>Sucursal:</strong> {r.nombre_sucursal}</p>
              <p style={{ margin: "2px 0" }}><strong>IP:</strong> {r.ip_cliente}</p>

              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button onClick={() => setSelectedRadio(r)}>Ver detalle</button>
                <button onClick={() => handleEdit(r)}>Editar</button>
                <button onClick={() => handleDelete(r.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle en móvil */}
      {selectedRadio && (
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
          onClick={() => setSelectedRadio(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Detalle de radio/antena</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(selectedRadio).map(([key, value]) => (
                <li key={key} style={{ marginBottom: "5px" }}>
                  <strong>{labels[key] || key}:</strong> {value ?? "-"}
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedRadio(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadiosAntenas;
