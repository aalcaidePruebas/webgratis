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
  Smile,
  Activity
} from "lucide-react";
import { getAdminAppointments, updateAppointmentStatus, Appointment } from "../actions";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [dateFilter, setDateFilter] = useState("all"); 
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

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

  const handleStatusChange = async (id: number, newStatus: "confirmed" | "cancelled" | "pending") => {
    setUpdatingId(id);
    setMessage("");
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        setMessage(`Cita actualizada correctamente.`);
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

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const todayStr = getTodayStr();
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch = 
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      (app.reason && app.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = app.date === todayStr;
    } else if (dateFilter === "upcoming") {
      matchesDate = app.date >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const todayCount = appointments.filter((app) => app.date === todayStr && app.status !== "cancelled").length;
  const pendingCount = appointments.filter((app) => app.status === "pending").length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Esferas decorativas de fondo difuminadas */}
      <div className="w-[250px] h-[250px] bg-indigo-100/40 rounded-full absolute -top-20 -left-20 pointer-events-none blur-[80px]" />
      <div className="w-[250px] h-[250px] bg-purple-100/30 rounded-full absolute bottom-40 -right-20 pointer-events-none blur-[80px]" />

      {/* Header Premium Violeta/Índigo */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white px-4 py-3.5 shadow-md relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-900 shadow-inner">
              <Sparkles className="w-4.5 h-4.5 fill-indigo-900" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight">MenteSana</span>
              <p className="text-[9px] uppercase tracking-widest text-indigo-200 leading-none font-bold">Panel Profesional</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadAppointments} 
              className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Refrescar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="border-l border-indigo-700/50 h-5" />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6 space-y-5 relative z-10">
        
        {/* Banner de Bienvenida y Estadísticas rápidas */}
        <section className="bg-white/80 backdrop-blur-md border border-indigo-100/30 rounded-2xl p-5 shadow-sm grid grid-cols-2 gap-4">
          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sesiones Hoy</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{todayCount}</span>
              <span className="text-xs text-slate-400 font-bold">pacientes</span>
            </div>
          </div>
          <div className="pl-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Por Confirmar</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <span className="text-xs text-slate-400 font-bold">pendientes</span>
            </div>
          </div>
        </section>

        {/* Mensaje de Alerta Flotante */}
        {message && (
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 font-bold text-xs px-4 py-3.5 rounded-xl flex items-center gap-2 animate-pulse shadow-sm">
            <AlertCircle className="w-4 h-4 text-indigo-700" />
            <span>{message}</span>
          </div>
        )}

        {/* Buscador y Filtros */}
        <section className="bg-white border border-slate-200/50 rounded-2xl p-4 shadow-sm space-y-3.5">
          {/* Campo de Búsqueda */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400"><Search className="w-4.5 h-4.5" /></span>
            <input
              type="text"
              placeholder="Buscar por paciente, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Fila de Filtros */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            {/* Filtro Estado */}
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-black mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Filtro Fecha */}
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-black mb-1">Fecha</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
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
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <span>Listado de Citas</span>
              <span className="font-mono text-indigo-900 font-black bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] border border-indigo-100/30">{filteredAppointments.length}</span>
            </h3>
            {statusFilter !== "all" || dateFilter !== "all" || searchQuery !== "" ? (
              <button 
                onClick={() => { setStatusFilter("all"); setDateFilter("all"); setSearchQuery(""); }}
                className="text-[10px] text-indigo-700 font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-bold">Cargando agenda...</span>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-200 ${
                    app.status === "confirmed" ? "border-indigo-100" :
                    app.status === "cancelled" ? "border-rose-100 bg-rose-50/5" :
                    "border-amber-100 bg-amber-50/5"
                  }`}
                >
                  {/* Badge de Estado del Turno */}
                  <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    app.status === "confirmed" ? "bg-indigo-50 text-indigo-800 border-indigo-100/50" :
                    app.status === "cancelled" ? "bg-rose-50 text-rose-800 border-rose-100/50" :
                    "bg-amber-50 text-amber-800 border-amber-100/50"
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
                          <span className="text-xs font-semibold text-slate-400">({app.patient_age} años)</span>
                        ) : null}
                      </h4>
                      <p className="text-[10px] text-indigo-800 font-black mt-0.5 uppercase tracking-widest">{app.service_name} • {app.service_price}€</p>
                    </div>

                    {/* Fecha y Hora del Turno */}
                    <div className="bg-indigo-50/30 border border-indigo-100/10 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-700" />
                        <span>{formatFriendlyDate(app.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-700" />
                        <span className="font-mono">{app.time_slot} hs</span>
                      </div>
                    </div>

                    {/* Datos de Contacto y Motivo */}
                    <div className="space-y-1 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="break-all">{app.patient_email}</span>
                      </div>
                      
                      {app.reason ? (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200 mt-1.5 text-slate-500">
                          <p className="text-[9px] uppercase font-black text-slate-400">Motivo de consulta:</p>
                          <p className="text-xs leading-relaxed mt-0.5 font-medium">{app.reason}</p>
                        </div>
                      ) : null}
                    </div>

                    {/* ACCIÓN LLAMADA DIRECTA PREMIUM */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2 relative z-20">
                      <a 
                        href={`tel:${app.patient_phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100/60 text-indigo-900 border border-indigo-200/50 py-3 rounded-xl text-xs font-black active:scale-[0.98] transition-all shadow-sm"
                      >
                        <Phone className="w-4 h-4 text-indigo-700" />
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
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 shadow-sm"
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
                              <span>Revertir</span>
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
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 col-span-2"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Restaurar Cita</span>
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
              <span className="text-xs font-bold text-slate-500">No se encontraron citas con estos filtros.</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Prueba a seleccionar otros criterios de búsqueda o recargar la página.</span>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-600 py-6 px-4 text-center text-[10px] border-t border-slate-900 relative z-10">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="text-slate-400 font-black uppercase tracking-wider text-[9px]">MenteSana Clínica</p>
          <p>© 2026 Reservas Web PWA • Panel de Gestión de Alta Seguridad</p>
        </div>
      </footer>
    </div>
  );
}
