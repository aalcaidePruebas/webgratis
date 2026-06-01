"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  Activity,
  MapPin,
  CalendarCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { 
  getActiveTherapist, 
  getServices, 
  getAvailableSlots, 
  createAppointment 
} from "./actions";

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string | number;
}

export default function LandingPage() {
  const [therapist, setTherapist] = useState<Therapist | null>({
    id: 1,
    name: "Dra. Sofía Alcaide",
    specialty: "Psicóloga Clínica y Terapeuta Cognitivo-Conductual",
    bio: "Especialista en ansiedad, depresión, superación de duelos y crecimiento personal. Más de 10 años acompañando a personas en su camino hacia el bienestar mental con un enfoque cálido, empático y profesional.",
    avatar: "/therapist.png"
  });
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Terapia Individual Estándar",
      description: "Sesión individual de psicoterapia orientada a adolescentes y adultos. Tratamiento de ansiedad, depresión, estrés laboral y apoyo emocional.",
      duration: 60,
      price: 60
    }
  ]);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    patient_age: "",
    reason: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      const activeTher = await getActiveTherapist();
      if (activeTher) setTherapist(activeTher);

      const servList = await getServices();
      if (servList && servList.length > 0) {
        setServices(servList as any);
        setSelectedService(servList[0] as any);
      } else {
        setSelectedService(services[0]);
      }
    }
    loadData();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setSelectedDate(tomorrowStr);
  }, []);

  useEffect(() => {
    if (selectedDate && therapist) {
      setLoadingSlots(true);
      setSelectedSlot("");
      getAvailableSlots(selectedDate, therapist.id)
        .then((slots) => {
          setAvailableSlots(slots);
          setLoadingSlots(false);
        })
        .catch(() => {
          setAvailableSlots([]);
          setLoadingSlots(false);
        });
    }
  }, [selectedDate, therapist]);

  const getTodayStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoToDetails = () => {
    if (!selectedService) {
      setErrorMsg("Por favor, selecciona un servicio.");
      return;
    }
    if (!selectedDate) {
      setErrorMsg("Por favor, selecciona una fecha.");
      return;
    }
    if (!selectedSlot) {
      setErrorMsg("Por favor, selecciona una hora para tu cita.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.patient_email || !formData.patient_phone) {
      setErrorMsg("Por favor, rellena los campos obligatorios (*).");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await createAppointment({
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        patient_age: formData.patient_age ? parseInt(formData.patient_age, 10) : 0,
        reason: formData.reason,
        date: selectedDate,
        time_slot: selectedSlot,
        therapist_id: therapist?.id || 1,
        service_id: selectedService?.id || 1
      });

      if (response.success) {
        setStep(3);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMsg(response.message || "Error al realizar la reserva.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error inesperado al procesar la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patient_name: "",
      patient_email: "",
      patient_phone: "",
      patient_age: "",
      reason: ""
    });
    setSelectedSlot("");
    setStep(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf8ff] to-[#f0f4ff] relative overflow-hidden">
      
      {/* Esferas de Fondo Difuminadas (Glassmorphism blobs) */}
      <div className="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-300/30 rounded-full absolute -top-40 -left-20 pointer-events-none blur-[100px] sm:blur-[120px]" />
      <div className="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-300/20 rounded-full absolute top-[40%] -right-20 pointer-events-none blur-[100px] sm:blur-[120px]" />
      <div className="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-pink-200/20 rounded-full absolute -bottom-40 left-[20%] pointer-events-none blur-[100px] sm:blur-[120px]" />

      {/* Header Glassmorphic */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#faf9fe]/70 border-b border-indigo-100/40 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-50" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-indigo-950">Mente<span className="text-indigo-600">Sana</span></span>
              <p className="text-[9px] uppercase tracking-widest text-indigo-700 font-bold leading-none">Psicología</p>
            </div>
          </Link>
          
          <Link 
            href="/admin" 
            className="text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-200 shadow-sm"
          >
            Área Profesional
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        
        {/* Hero Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Texto Promocional */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">
                <Heart className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>Salud Mental & Crecimiento Personal</span>
              </span>
              
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Encuentra tu espacio de <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">bienestar mental</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Inicia un camino de autoconocimiento y calma emocional. Sesiones personalizadas de 60 minutos con un trato humano, empático y 100% profesional.
              </p>

              {/* Perfil de Terapeuta Moderno */}
              {therapist && (
                <div className="bg-white/70 backdrop-blur-md border border-white/80 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start text-left gap-4 max-w-md mx-auto lg:mx-0 shadow-md shadow-indigo-950/5">
                  <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-indigo-100 shadow-sm">
                    <Image
                      src={therapist.avatar}
                      alt={therapist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-extrabold text-slate-900 text-base">{therapist.name}</h3>
                    <p className="text-xs text-indigo-700 font-bold">{therapist.specialty}</p>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{therapist.bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* WIDGET DE RESERVA INTERACTIVO PREMIUM */}
            <div className="lg:col-span-6">
              <div id="booking-widget" className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/5 relative overflow-hidden transition-all duration-300">
                
                {/* Indicador de Pasos */}
                <div className="flex items-center justify-between border-b border-indigo-50 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Reserva de Cita</span>
                    <h2 className="text-lg font-black text-slate-900">
                      {step === 1 && "1. Fecha y Hora"}
                      {step === 2 && "2. Rellena tus Datos"}
                      {step === 3 && "¡Cita Solicitada!"}
                    </h2>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className={`w-7 h-2 rounded-full transition-all duration-300 ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
                    <div className={`w-7 h-2 rounded-full transition-all duration-300 ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
                    <div className={`w-7 h-2 rounded-full transition-all duration-300 ${step === 3 ? "bg-indigo-600" : "bg-slate-200"}`} />
                  </div>
                </div>

                {/* PASO 1: SELECCIONAR SERVICIO, FECHA Y HORA */}
                {step === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    
                    {/* Selección de Servicio */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Servicio</label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {services.map((serv) => (
                          <div 
                            key={serv.id}
                            onClick={() => setSelectedService(serv)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                              selectedService?.id === serv.id 
                                ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                                : "border-slate-100 bg-white/40 hover:border-indigo-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">{serv.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{serv.duration} min de consulta</p>
                              </div>
                              <span className="text-sm font-black text-indigo-700 font-mono">{serv.price}€</span>
                            </div>
                            {selectedService?.id === serv.id && (
                              <div className="absolute bottom-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Fecha */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Día de la consulta</label>
                      <input
                        type="date"
                        min={getTodayStr()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-white/50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                      />
                    </div>

                    {/* Selector de Horas Disponibles */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Horarios Disponibles</label>
                        <span className="text-[10px] text-indigo-700 font-bold">Pago en consulta</span>
                      </div>
                      
                      {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-slate-400 font-bold">Buscando horas libres...</span>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                          {availableSlots.map((slot) => (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-2 rounded-xl text-xs font-black font-mono transition-all duration-200 active:scale-95 ${
                                selectedSlot === slot
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                  : "bg-indigo-50/40 hover:bg-indigo-100/50 border border-indigo-100/30 text-indigo-900"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                          <AlertCircle className="w-5 h-5 text-slate-400 mb-1.5" />
                          <span className="text-xs font-bold text-slate-500">No hay turnos disponibles para este día.</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Por favor, prueba con otro día laborable.</span>
                        </div>
                      )}
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </p>
                    )}

                    {/* Botón Siguiente */}
                    <button
                      type="button"
                      onClick={handleGoToDetails}
                      disabled={!selectedSlot}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-200 mt-2"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* PASO 2: FORMULARIO DE DATOS DEL PACIENTE */}
                {step === 2 && (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 animate-fadeIn">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-indigo-800 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a fecha y hora</span>
                    </button>

                    {/* Resumen del Turno */}
                    <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl text-xs space-y-1.5 text-indigo-950 font-bold">
                      <p>✨ <span className="text-indigo-600">Servicio:</span> {selectedService?.name}</p>
                      <p>📅 <span className="text-indigo-600">Fecha:</span> {selectedDate.split("-").reverse().join("/")}</p>
                      <p>⏰ <span className="text-indigo-600">Hora:</span> {selectedSlot} hs ({selectedService?.duration} min)</p>
                      <p>💰 <span className="text-indigo-600">Coste:</span> {selectedService?.price}€ (Pago presencial en consulta)</p>
                    </div>

                    {/* Campo Nombre */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nombre Completo *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400"><User className="w-4 h-4" /></span>
                        <input
                          type="text"
                          name="patient_name"
                          required
                          placeholder="Tu nombre y apellidos"
                          value={formData.patient_name}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Fila Email y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-slate-400"><Mail className="w-4 h-4" /></span>
                          <input
                            type="email"
                            name="patient_email"
                            required
                            placeholder="ejemplo@correo.com"
                            value={formData.patient_email}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Teléfono *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-slate-400"><Phone className="w-4 h-4" /></span>
                          <input
                            type="tel"
                            name="patient_phone"
                            required
                            placeholder="600 000 000"
                            value={formData.patient_phone}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fila Edad */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Edad (Opcional)</label>
                      <input
                        type="number"
                        name="patient_age"
                        placeholder="Ej: 30"
                        value={formData.patient_age}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    {/* Campo Motivo */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Motivo de consulta (Opcional)</label>
                      <textarea
                        name="reason"
                        rows={2}
                        placeholder="Breve descripción para ayudar a preparar tu sesión..."
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </p>
                    )}

                    {/* Botones Enviar */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-200"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Guardando Cita...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar Cita</span>
                          <CheckCircle className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* PASO 3: CONFIRMACIÓN EXITOSA */}
                {step === 3 && (
                  <div className="text-center py-6 space-y-5 animate-fadeIn">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm shadow-indigo-600/10 border border-indigo-100/50">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-black text-slate-900">¡Tu cita ha sido solicitada!</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Te hemos enviado un correo. Tu reserva está registrada de forma segura como **pendiente de confirmación** en nuestra agenda.
                      </p>
                    </div>

                    {/* Tarjeta de Resumen */}
                    <div className="bg-indigo-50/30 border border-indigo-100/30 p-5 rounded-2xl text-left text-xs max-w-sm mx-auto space-y-2 font-bold text-slate-800">
                      <p>✨ <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mr-1.5">Paciente:</span> {formData.patient_name}</p>
                      <p>📅 <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mr-1.5">Fecha:</span> {selectedDate.split("-").reverse().join("/")}</p>
                      <p>⏰ <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mr-1.5">Hora:</span> {selectedSlot} hs</p>
                      <p>💰 <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mr-1.5">Precio:</span> {selectedService?.price}€ (Pago presencial en consulta)</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-black text-indigo-700 hover:text-indigo-950 hover:underline"
                      >
                        Reservar otra cita
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Sección de Beneficios / Servicios */}
        <section className="py-16 bg-white/40 px-4 sm:px-6 lg:px-8 border-y border-indigo-100/20 backdrop-blur-md">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Atención Clínica de Máxima Calidad</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Ofrecemos un entorno seguro, ético y sumamente confidencial para acompañarte en tu bienestar psicológico.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 border border-indigo-100/20 p-6 rounded-2xl shadow-sm space-y-3.5 backdrop-blur-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">1</div>
                <h3 className="font-extrabold text-slate-900 text-base">Absoluta Confidencialidad</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tus datos e información clínica están totalmente protegidos de acuerdo con la legislación vigente de protección de datos (RGPD).
                </p>
              </div>

              <div className="bg-white/80 border border-indigo-100/20 p-6 rounded-2xl shadow-sm space-y-3.5 backdrop-blur-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">2</div>
                <h3 className="font-extrabold text-slate-900 text-base">Terapia Personalizada</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Diseñamos las sesiones de forma flexible adaptándolas a tus dinámicas, metas personales e historia de vida particular.
                </p>
              </div>

              <div className="bg-white/80 border border-indigo-100/20 p-6 rounded-2xl shadow-sm space-y-3.5 backdrop-blur-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">3</div>
                <h3 className="font-extrabold text-slate-900 text-base">Instalable como PWA</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Añade esta web a la pantalla de inicio de tu iPhone o Android y accede de forma instantánea como si fuera una app nativa.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-xs relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-2">
            <span className="text-sm font-black text-white tracking-tight">MenteSana</span>
            <p className="text-[10px] text-slate-600">© 2026 Mente Sana Clínica de Psicología. Todos los derechos reservados.</p>
          </div>
          
          <div className="flex space-x-6 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="/" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/admin" className="text-indigo-400 font-extrabold hover:text-indigo-300 transition-colors">Acceso Profesional</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
