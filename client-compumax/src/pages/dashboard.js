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

  //filtros y búsqueda
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

  //listas únicas de clientes, sucursales y tipos
  const clientes = [...new Set(equipos.map((e) => e.nombre_cliente))];
  const sucursales = [...new Set(equipos.map((e) => e.nombre_sucursal))];
  const tipos = [...new Set(equipos.map((e) => e.tipo))];

  //columnas para la tabla
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

  //campos tarjetas
  const cardFields = [
    { label: "Cliente", accessor: "nombre_cliente" },
    { label: "Sucursal", accessor: "nombre_sucursal" },
    { label: "Tipo", accessor: "tipo" },
    { label: "Nombre", accessor: "nombre" },
    { label: "Modelo", accessor: (row) => row.modelo || "-" },
    { label: "MAC", accessor: (row) => row.mac || "-" },
    { label: "IP Cliente", accessor: (row) => row.ip_cliente || "-" },
  ];

  //resumen
  const totalEquipos = equipos.length;
  const totalClientes = clientes.length;
  const totalSucursales = sucursales.length;
  const equiposPorTipo = tipos.map((t) => ({
    tipo: t,
    cantidad: equipos.filter((e) => e.tipo === t).length,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard de Equipos</h1>

      {/*Resumen*/}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Equipos</h3>
          <p>{totalEquipos}</p>
        </div>
        <div style={cardStyle}>
          <h3>Clientes</h3>
          <p>{totalClientes}</p>
        </div>
        <div style={cardStyle}>
          <h3>Sucursales</h3>
          <p>{totalSucursales}</p>
        </div>
        {equiposPorTipo.map((et) => (
          <div key={et.tipo} style={cardStyle}>
            <h3>{et.tipo}</h3>
            <p>{et.cantidad}</p>
          </div>
        ))}
      </div>

      {/*Filtros */}
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
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
        />

        <button onClick={limpiarFiltros}>Limpiar filtros</button>
      </div>

      {/* Vista responsiva */}
      {!isMobile ? (
        <ResponsiveTable columns={columns} data={equiposFiltrados} />
      ) : (
        <div>
          {equiposFiltrados.map((e) => (
            <EntityCard
              key={`${e.tipo}-${e.id}`}
              item={e}
              fields={cardFields}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  flex: "1 1 150px",
  background: "#f9f9f9",
  borderRadius: "10px",
  padding: "15px",
  textAlign: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

export default Dashboard;
