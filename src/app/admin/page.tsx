"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Check, 
  X, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  Smile
} from "lucide-react";
import { getAdminAppointments, updateAppointmentStatus, Appointment } from "../actions";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'confirmed', 'cancelled'
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'upcoming'
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Cargar citas al montar
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const list = await getAdminAppointments();
      setAppointments(list);
    } catch (error) {
      console.error(error);
      setMessage("Error al cargar la agenda.");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar el estado de la cita (Confirmar/Cancelar)
  const handleStatusChange = async (id: number, newStatus: "confirmed" | "cancelled" | "pending") => {
    setUpdatingId(id);
    setMessage("");
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        // Actualizar estado local
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        setMessage(`Cita actualizada correctamente.`);
        // Autohide mensaje tras 3 segundos
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("No se pudo actualizar la cita.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error al actualizar la cita.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helpers de fechas
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Filtrado de citas
  const todayStr = getTodayStr();
  const filteredAppointments = appointments.filter((app) => {
    // 1. Filtro de búsqueda (nombre, email, teléfono, motivo)
    const matchesSearch = 
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      (app.reason && app.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Filtro de estado
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    // 3. Filtro de fecha
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = app.date === todayStr;
    } else if (dateFilter === "upcoming") {
      matchesDate = app.date >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Estadísticas rápidas
  const todayCount = appointments.filter((app) => app.date === todayStr && app.status !== "cancelled").length;
  const pendingCount = appointments.filter((app) => app.status === "pending").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f5]">
      {/* Header Fijo Móvil */}
      <header className="sticky top-0 z-50 bg-[#2f5c47] text-white px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800">
              <Sparkles className="w-4 h-4 fill-emerald-800" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight">MenteSana</span>
              <p className="text-[9px] uppercase tracking-wider text-emerald-200 leading-none">Agenda Médica</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadAppointments} 
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-800/40 rounded-lg transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="border-l border-emerald-600/50 h-5" />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-5 space-y-5">
        
        {/* Banner de Bienvenida y Estadísticas rápidas */}
        <section className="bg-white border border-emerald-100/40 rounded-2xl p-5 shadow-sm grid grid-cols-2 gap-4">
          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Citas para Hoy</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{todayCount}</span>
              <span className="text-xs text-slate-500 font-semibold">sesiones</span>
            </div>
          </div>
          <div className="pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Por Confirmar</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <span className="text-xs text-slate-500 font-semibold">pendientes</span>
            </div>
          </div>
        </section>

        {/* Mensaje de Alerta Flotante */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-emerald-800" />
            <span>{message}</span>
          </div>
        )}

        {/* Buscador y Filtros */}
        <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3.5">
          {/* Campo de Búsqueda */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400"><Search className="w-4.5 h-4.5" /></span>
            <input
              type="text"
              placeholder="Buscar paciente, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Fila de Filtros */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            {/* Filtro Estado */}
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Filtro Fecha */}
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Fecha</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">Todas las Fechas</option>
                <option value="today">Hoy</option>
                <option value="upcoming">Futuras</option>
              </select>
            </div>
          </div>
        </section>

        {/* Listado de Citas */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Listado de Citas</span>
              <span className="font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">{filteredAppointments.length}</span>
            </h3>
            {statusFilter !== "all" || dateFilter !== "all" || searchQuery !== "" ? (
              <button 
                onClick={() => { setStatusFilter("all"); setDateFilter("all"); setSearchQuery(""); }}
                className="text-[10px] text-emerald-800 font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-semibold">Cargando agenda...</span>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-200 ${
                    app.status === "confirmed" ? "border-emerald-100" :
                    app.status === "cancelled" ? "border-rose-100 bg-rose-50/10" :
                    "border-amber-100 bg-amber-50/5"
                  }`}
                >
                  {/* Badge de Estado del Turno */}
                  <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    app.status === "confirmed" ? "bg-emerald-100 text-emerald-800" :
                    app.status === "cancelled" ? "bg-rose-100 text-rose-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {app.status === "confirmed" && "Confirmado"}
                    {app.status === "cancelled" && "Cancelado"}
                    {app.status === "pending" && "Pendiente"}
                  </span>

                  {/* Fila Principal Info Paciente */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                        <span>{app.patient_name}</span>
                        {app.patient_age ? (
                          <span className="text-xs font-medium text-slate-400">({app.patient_age} años)</span>
                        ) : null}
                      </h4>
                      <p className="text-[10px] text-emerald-800 font-extrabold mt-0.5">{app.service_name} • {app.service_price}€</p>
                    </div>

                    {/* Fecha y Hora del Turno en una Tarjeta Compacta */}
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-800" />
                        <span>{formatFriendlyDate(app.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-800" />
                        <span className="font-mono">{app.time_slot} hs</span>
                      </div>
                    </div>

                    {/* Datos de Contacto y Motivo */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="break-all">{app.patient_email}</span>
                      </div>
                      
                      {app.reason ? (
                        <div className="bg-slate-50/40 p-2 rounded-lg border border-dashed border-slate-100 mt-1.5 text-slate-500">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Motivo de consulta:</p>
                          <p className="text-xs leading-relaxed mt-0.5">{app.reason}</p>
                        </div>
                      ) : null}
                    </div>

                    {/* ACCIÓN LLAMADA DIRECTA (CLIC DESDE MÓVIL) */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                      <a 
                        href={`tel:${app.patient_phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100/60 text-emerald-900 border border-emerald-200/50 py-3 rounded-xl text-xs font-extrabold active:scale-[0.98] transition-all shadow-sm"
                      >
                        <Phone className="w-4 h-4 text-emerald-700" />
                        <span>Llamar al Paciente ({app.patient_phone})</span>
                      </a>

                      {/* Botones de Gestión de Estado */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {app.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id!, "confirmed")}
                              disabled={updatingId === app.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id!, "cancelled")}
                              disabled={updatingId === app.id}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}

                        {app.status === "confirmed" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id!, "pending")}
                              disabled={updatingId === app.id}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 col-span-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Revertir a Pendiente</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id!, "cancelled")}
                              disabled={updatingId === app.id}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 col-span-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}

                        {app.status === "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id!, "pending")}
                            disabled={updatingId === app.id}
                            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 col-span-2"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Restaurar Cita a Pendiente</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
              <Smile className="w-8 h-8 text-slate-300 mb-1.5" />
              <span className="text-xs font-semibold text-slate-500">No se encontraron citas con estos filtros.</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Prueba a seleccionar otros criterios de búsqueda o recargar la página.</span>
            </div>
          )}
        </section>
      </main>

      {/* Footer Fijo Pequeño */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-4 text-center text-[10px] border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="text-slate-400 font-bold">MenteSana Clínica</p>
          <p>© 2026 Reservas Web PWA • Panel de Gestión de Alta Seguridad</p>
        </div>
      </footer>
    </div>
  );
}
