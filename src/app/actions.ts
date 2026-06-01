"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Tipo para Cita
export interface Appointment {
  id?: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_age: number;
  reason: string;
  date: string;
  time_slot: string;
  therapist_id: number;
  service_id: number;
  status: string;
  created_at?: string;
  service_name?: string;
  service_price?: number;
}

// 1. Obtener la información del Terapeuta activo
export async function getActiveTherapist() {
  try {
    const rows = await sql`
      SELECT id, name, specialty, bio, avatar 
      FROM therapists 
      WHERE active = TRUE 
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener terapeuta:", error);
    return null;
  }
}

// 2. Obtener los servicios disponibles
export async function getServices() {
  try {
    return await sql`
      SELECT id, name, description, duration, price 
      FROM services 
      ORDER BY id ASC
    `;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return [];
  }
}

// 3. Obtener turnos/horas disponibles para una fecha específica
export async function getAvailableSlots(dateStr: string, therapistId: number = 1) {
  try {
    if (!dateStr) return [];
    
    // Obtener día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();

    // 1. Consultar disponibilidad del terapeuta para este día de la semana
    const availability = await sql`
      SELECT start_time, end_time 
      FROM availability 
      WHERE therapist_id = ${therapistId} AND day_of_week = ${dayOfWeek}
      LIMIT 1
    `;

    if (availability.length === 0) {
      return []; // No trabaja este día
    }

    const { start_time, end_time } = availability[0];
    
    // Convertir horarios (HH:MM:SS) a horas numéricas
    const startHour = parseInt(start_time.split(":")[0], 10);
    const endHour = parseInt(end_time.split(":")[0], 10);
    
    // Generar slots de 60 minutos (duración de la sesión estándar)
    const allSlots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, "0") + ":00";
      allSlots.push(formattedHour);
    }

    // 2. Consultar citas ya reservadas para este día y terapeuta (que no estén canceladas)
    const bookedAppointments = await sql`
      SELECT time_slot 
      FROM appointments 
      WHERE therapist_id = ${therapistId} 
        AND date = ${dateStr} 
        AND status != 'cancelled'
    `;
    const bookedSlots = bookedAppointments.map((app: any) => app.time_slot);

    // 3. Consultar bloqueos específicos del administrador para esta fecha
    const blockedSlotsQuery = await sql`
      SELECT time_slot 
      FROM blocked_slots 
      WHERE therapist_id = ${therapistId} AND date = ${dateStr}
    `;
    
    const blockedSlots = blockedSlotsQuery.map((b: any) => b.time_slot);
    const isFullDayBlocked = blockedSlotsQuery.length > 0 && blockedSlotsQuery.some((b: any) => b.time_slot === null);

    if (isFullDayBlocked) {
      return []; // Todo el día bloqueado (vacaciones, festivos, etc.)
    }

    // 4. Filtrar slots libres
    let freeSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot) && !blockedSlots.includes(slot)
    );

    // 5. Si la fecha consultada es HOY, excluir horas que ya pasaron
    const todayStr = new Date().toISOString().split("T")[0];
    if (dateStr === todayStr) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      freeSlots = freeSlots.filter((slot) => {
        const [slotHour, slotMin] = slot.split(":").map(Number);
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMin > currentMinute) return true;
        return false;
      });
    }

    return freeSlots;
  } catch (error) {
    console.error("Error al obtener slots disponibles:", error);
    return [];
  }
}

// 4. Crear una nueva cita (Paciente)
export async function createAppointment(data: Omit<Appointment, "status">) {
  try {
    const {
      patient_name,
      patient_email,
      patient_phone,
      patient_age,
      reason,
      date,
      time_slot,
      therapist_id,
      service_id
    } = data;

    // Validación básica en servidor
    if (!patient_name || !patient_email || !patient_phone || !date || !time_slot) {
      return { success: false, message: "Faltan campos obligatorios" };
    }

    // Comprobar si el slot sigue estando libre justo antes de guardar (evitar doble reserva)
    const activeBookings = await sql`
      SELECT id FROM appointments 
      WHERE therapist_id = ${therapist_id} 
        AND date = ${date} 
        AND time_slot = ${time_slot} 
        AND status != 'cancelled'
      LIMIT 1
    `;
    if (activeBookings.length > 0) {
      return { success: false, message: "Lo sentimos, este horario acaba de ser reservado por otra persona." };
    }

    await sql`
      INSERT INTO appointments (
        patient_name, 
        patient_email, 
        patient_phone, 
        patient_age, 
        reason, 
        date, 
        time_slot, 
        therapist_id, 
        service_id, 
        status
      ) VALUES (
        ${patient_name}, 
        ${patient_email}, 
        ${patient_phone}, 
        ${patient_age}, 
        ${reason}, 
        ${date}, 
        ${time_slot}, 
        ${therapist_id}, 
        ${service_id}, 
        'pending'
      )
    `;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al crear cita:", error);
    return { success: false, message: "Error interno al guardar la reserva" };
  }
}

// 5. Obtener todas las citas para el Panel de Administración (Ordenadas por fecha y hora)
export async function getAdminAppointments() {
  try {
    const rows = await sql`
      SELECT 
        a.id, 
        a.patient_name, 
        a.patient_email, 
        a.patient_phone, 
        a.patient_age, 
        a.reason, 
        TO_CHAR(a.date, 'YYYY-MM-DD') as date, 
        a.time_slot, 
        a.status,
        s.name as service_name,
        s.price as service_price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      ORDER BY a.date DESC, a.time_slot ASC
    `;
    return rows as Appointment[];
  } catch (error) {
    console.error("Error al obtener citas de administración:", error);
    return [];
  }
}

// 6. Actualizar el estado de una cita (Confirmar / Cancelar)
export async function updateAppointmentStatus(id: number, status: "confirmed" | "cancelled" | "pending") {
  try {
    await sql`
      UPDATE appointments 
      SET status = ${status} 
      WHERE id = ${id}
    `;
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado de cita:", error);
    return { success: false };
  }
}

// 7. Bloquear un slot de día o de hora (Administrador)
export async function blockSlot(date: string, time_slot: string | null = null, therapistId: number = 1) {
  try {
    await sql`
      INSERT INTO blocked_slots (therapist_id, date, time_slot)
      VALUES (${therapistId}, ${date}, ${time_slot})
    `;
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al bloquear horario:", error);
    return { success: false };
  }
}
