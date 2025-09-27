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
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

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
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Routers / Switches</h2>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="p-2 border rounded-lg"
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
          className="p-2 border rounded-lg"
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
        className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow"
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
        <button type="submit" className="col-span-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          {formData.id ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/* Tabla en desktop / Cards en móvil */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={filteredRouters} />
      ) : (
        <div className="space-y-4">
          {filteredRouters.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded-lg shadow border">
              <h4 className="font-semibold text-gray-800">
                {r.nombre} <span className="text-sm text-gray-500">({r.modelo})</span>
              </h4>
              <p className="text-sm text-gray-600"><strong>Cliente:</strong> {r.nombre_cliente}</p>
              <p className="text-sm text-gray-600"><strong>Sucursal:</strong> {r.nombre_sucursal}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedRouter(r)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                >
                  Ver más
                </button>
                <button
                  onClick={() => handleEdit(r)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle en móvil */}
      {selectedRouter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedRouter(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Detalle de router/switch</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {Object.entries(selectedRouter).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium capitalize">{labels[key] || key}:</span> {value ?? "-"}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedRouter(null)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoutersSwitches;
