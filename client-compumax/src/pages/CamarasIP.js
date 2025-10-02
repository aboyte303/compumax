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

  // 🔎 Filtro y búsqueda
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
    {
      header: "Acciones",
      accessor: "acciones",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Cámaras IP</h2>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded-lg shadow-sm"
        />
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {cl.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtroSucursal}
          onChange={(e) => setFiltroSucursal(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md"
      >
        <select
          name="id_sucursal"
          value={formData.id_sucursal}
          onChange={handleChange}
          required
          className="p-2 border rounded-lg"
        >
          <option value="">Seleccione Sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre_cliente} - {s.nombre}
            </option>
          ))}
        </select>
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required className="p-2 border rounded-lg" />
        <input type="text" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="mac" placeholder="MAC" value={formData.mac} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="sn" placeholder="Serie (SN)" value={formData.sn} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="ubicacion" placeholder="Ubicación" value={formData.ubicacion} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="zona" placeholder="Zona" value={formData.zona} onChange={handleChange} className="p-2 border rounded-lg" />
        <input type="text" name="ip_cliente" placeholder="IP Cliente" value={formData.ip_cliente} onChange={handleChange} className="p-2 border rounded-lg" />
        <button type="submit" className="col-span-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          {formData.id ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/* Tabla desktop o cards en móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredCamaras} />
      ) : (
        <div className="space-y-4">
          {filteredCamaras.map((c) => (
            <div key={c.id} className="p-4 bg-white rounded-lg shadow border">
              <h4 className="font-semibold text-gray-800">{c.nombre}</h4>
              <p className="text-sm text-gray-600"><strong>Modelo:</strong> {c.modelo}</p>
              <p className="text-sm text-gray-600"><strong>Cliente:</strong> {c.nombre_cliente}</p>
              <p className="text-sm text-gray-600"><strong>Sucursal:</strong> {c.nombre_sucursal}</p>
              <p className="text-sm text-gray-600"><strong>IP:</strong> {c.ip_cliente}</p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => setSelectedCamara(c)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                  Ver más
                </button>
                <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600">
                  Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CamarasIP;
