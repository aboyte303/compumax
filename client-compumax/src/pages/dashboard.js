import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import ResponsiveTable from "../components/ResponsiveTable";
import EntityCard from "../components/EntityCard";
import useIsMobile from "../hooks/useIsMobile";

function Dashboard() {
  const [equipos, setEquipos] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const isMobile = useIsMobile();

  const fetchEquipos = async () => {
    try {
      const res = await api.get("/dashboard");
      setEquipos(res.data);
    } catch (err) {
      console.error("Error al obtener equipos:", err);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroCliente("");
    setFiltroSucursal("");
    setFiltroTipo("");
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  //Filtros y búsqueda
  const equiposFiltrados = useMemo(() => {
    return equipos.filter((e) => {
      return (
        (filtroCliente ? e.nombre_cliente === filtroCliente : true) &&
        (filtroSucursal ? e.nombre_sucursal === filtroSucursal : true) &&
        (filtroTipo ? e.tipo === filtroTipo : true) &&
        (busqueda
          ? e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.mac?.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.ip_cliente?.toLowerCase().includes(busqueda.toLowerCase())
          : true)
      );
    });
  }, [equipos, filtroCliente, filtroSucursal, filtroTipo, busqueda]);

  //Listas únicas
  const clientes = [...new Set(equipos.map((e) => e.nombre_cliente))];
  const sucursales = [...new Set(equipos.map((e) => e.nombre_sucursal))];
  const tipos = [...new Set(equipos.map((e) => e.tipo))];

  //Columnas tabla
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cliente", accessor: "nombre_cliente" },
    { header: "Sucursal", accessor: "nombre_sucursal" },
    { header: "Tipo", accessor: "tipo" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: (row) => row.modelo || "-" },
    { header: "MAC", accessor: (row) => row.mac || "-" },
    { header: "IP Cliente", accessor: (row) => row.ip_cliente || "-" },
  ];

  //Campos tarjetas
  const cardFields = [
    { label: "Cliente", accessor: "nombre_cliente" },
    { label: "Sucursal", accessor: "nombre_sucursal" },
    { label: "Tipo", accessor: "tipo" },
    { label: "Nombre", accessor: "nombre" },
    { label: "Modelo", accessor: (row) => row.modelo || "-" },
    { label: "MAC", accessor: (row) => row.mac || "-" },
    { label: "IP Cliente", accessor: (row) => row.ip_cliente || "-" },
  ];

  //Resumen
  const totalEquipos = equipos.length;
  const totalClientes = clientes.length;
  const totalSucursales = sucursales.length;
  const equiposPorTipo = tipos.map((t) => ({
    tipo: t,
    cantidad: equipos.filter((e) => e.tipo === t).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard de Equipos</h1>

      {/*Resumen */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-600">Total Equipos</h3>
          <p className="text-2xl font-bold">{totalEquipos}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-600">Clientes</h3>
          <p className="text-2xl font-bold">{totalClientes}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-600">Sucursales</h3>
          <p className="text-2xl font-bold">{totalSucursales}</p>
        </div>
        {equiposPorTipo.map((et) => (
          <div
            key={et.tipo}
            className="bg-white p-4 rounded-xl shadow text-center"
          >
            <h3 className="font-semibold text-gray-600">{et.tipo}</h3>
            <p className="text-2xl font-bold">{et.cantidad}</p>
          </div>
        ))}
      </div>

      {/*Filtros */}
      <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-4 rounded-lg shadow">
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filtroSucursal}
          onChange={(e) => setFiltroSucursal(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar (nombre, modelo, MAC, IP)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />

        <button
          onClick={limpiarFiltros}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Limpiar
        </button>
      </div>

      {/*Tabla / Cards */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={equiposFiltrados} />
      ) : (
        <div className="space-y-4">
          {equiposFiltrados.map((e) => (
            <EntityCard key={`${e.tipo}-${e.id}`} item={e} fields={cardFields} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
