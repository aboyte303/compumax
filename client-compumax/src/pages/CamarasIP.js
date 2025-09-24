import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";

function CamarasIP() {
  const [camaras, setCamaras] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCamara, setSelectedCamara] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    id_sucursal: "",
    nombre: "",
    modelo: "",
    mac: "",
    sn: "",
    ubicacion: "",
    zona: "",
    usuario: "",
    contrasena: "",
    ip_cliente: "",
  });

  useEffect(() => {
    fetchCamaras();
    fetchSucursales();
    fetchClientes();

    // Detectar si es móvil
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCamaras = async () => {
    const res = await api.get("/camarasip");
    setCamaras(res.data);
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
      await api.put(`/camarasip/${formData.id}`, formData);
    } else {
      await api.post("/camarasip", formData);
    }
    setFormData({
      id: null,
      id_sucursal: "",
      nombre: "",
      modelo: "",
      mac: "",
      sn: "",
      ubicacion: "",
      zona: "",
      usuario: "",
      contrasena: "",
      ip_cliente: "",
    });
    fetchCamaras();
  };

  const handleEdit = (camara) => {
    setFormData({
      id: camara.id,
      id_sucursal: camara.id_sucursal?.toString() || "",
      nombre: camara.nombre,
      modelo: camara.modelo,
      mac: camara.mac,
      sn: camara.sn,
      usuario: camara.usuario,
      contrasena: camara.contrasena,
      ubicacion: camara.ubicacion,
      zona: camara.zona,
      ip_cliente: camara.ip_cliente,
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/camarasip/${id}`);
    fetchCamaras();
  };

  // Filtro y búsqueda
  const filteredCamaras = camaras.filter((c) => {
    const matchSearch =
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      c.mac?.toLowerCase().includes(search.toLowerCase()) ||
      c.sn?.toLowerCase().includes(search.toLowerCase()) ||
      c.ip_cliente?.toLowerCase().includes(search.toLowerCase()) ||
      c.nombre_cliente?.toLowerCase().includes(search.toLowerCase()) ||
      c.nombre_sucursal?.toLowerCase().includes(search.toLowerCase());

    const matchCliente = filtroCliente ? c.id_cliente === parseInt(filtroCliente) : true;
    const matchSucursal = filtroSucursal ? c.id_sucursal === parseInt(filtroSucursal) : true;

    return matchSearch && matchCliente && matchSucursal;
  });

  // Columnas de la tabla (solo para desktop)
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre_sucursal" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: "modelo" },
    { header: "MAC", accessor: "mac" },
    { header: "SN", accessor: "sn" },
    { header: "Usuario", accessor: "usuario" },
    { header: "Ubicación", accessor: "ubicacion" },
    { header: "Zona", accessor: "zona" },
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

  return (
    <div>
      <h2>Cámaras IP</h2>

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
        <input type="text" name="ubicacion" placeholder="Ubicación" value={formData.ubicacion} onChange={handleChange} />
        <input type="text" name="zona" placeholder="Zona" value={formData.zona} onChange={handleChange} />
        <input type="text" name="ip_cliente" placeholder="IP Cliente" value={formData.ip_cliente} onChange={handleChange} />
        <button type="submit">{formData.id ? "Actualizar" : "Agregar"}</button>
      </form>

      {/* Tabla en desktop / Cards en móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredCamaras} />
      ) : (
        <div>
          {filteredCamaras.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "12px",
                background: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              <h4 style={{ marginBottom: "5px" }}>{c.nombre}</h4>
              <p style={{ margin: "2px 0" }}><strong>Modelo:</strong> {c.modelo}</p>
              <p style={{ margin: "2px 0" }}><strong>Cliente:</strong> {c.nombre_cliente}</p>
              <p style={{ margin: "2px 0" }}><strong>Sucursal:</strong> {c.nombre_sucursal}</p>
              <p style={{ margin: "2px 0" }}><strong>IP:</strong> {c.ip_cliente}</p>

              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button onClick={() => setSelectedCamara(c)}>Ver más</button>
                <button onClick={() => handleEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle en móvil */}
      {selectedCamara && (
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
          onClick={() => setSelectedCamara(null)}
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
            <h3>Detalle de cámara</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(selectedCamara).map(([key, value]) => (
                <li key={key} style={{ marginBottom: "5px" }}>
                  <strong>{key}:</strong> {value ?? "-"}
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedCamara(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CamarasIP;
