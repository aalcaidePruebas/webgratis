-- ====================================================================
-- ESQUEMA DE BASE DE DATOS PARA CLÍNICA DE PSICOLOGÍA "MENTE SANA"
-- ====================================================================

-- 1. Tabla de Terapeutas (Escalable para múltiples psicólogos)
CREATE TABLE IF NOT EXISTS therapists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  bio TEXT NOT NULL,
  avatar TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 2. Tabla de Servicios (Tarifas y duraciones)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  duration INT NOT NULL, -- Duración en minutos (ej: 60)
  price DECIMAL(10,2) NOT NULL -- Precio en Euros (ej: 60.00)
);

-- 3. Tabla de Citas (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(100) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_age INT,
  reason TEXT,
  date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL, -- Formato "HH:MM" (ej: "09:00")
  therapist_id INT REFERENCES therapists(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Horarios de Disponibilidad Semanal de los Terapeutas
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  therapist_id INT REFERENCES therapists(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0 (Domingo) a 6 (Sábado)
  start_time TIME NOT NULL, -- ej: "09:00:00"
  end_time TIME NOT NULL, -- ej: "18:00:00"
  UNIQUE (therapist_id, day_of_week)
);

-- 5. Fechas o Bloques Horarios Bloqueados (Vacaciones, días festivos)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id SERIAL PRIMARY KEY,
  therapist_id INT REFERENCES therapists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot VARCHAR(10) -- Si es NULL, bloquea todo el día
);


-- ====================================================================
-- SEMILLA / DATOS INICIALES (SEED DATA)
-- ====================================================================

-- Insertar terapeuta inicial (puedes cambiar el nombre)
INSERT INTO therapists (id, name, specialty, bio, avatar, active)
VALUES (
  1, 
  'Dra. Sofía Alcaide', 
  'Psicóloga Clínica y Terapeuta Cognitivo-Conductual', 
  'Especialista en ansiedad, depresión, superación de duelos y crecimiento personal. Más de 10 años acompañando a personas en su camino hacia el bienestar mental con un enfoque cálido, empático y profesional.', 
  '/therapist.png', 
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Insertar servicio predeterminado
INSERT INTO services (id, name, description, duration, price)
VALUES (
  1, 
  'Terapia Individual Estándar', 
  'Sesión individual de psicoterapia orientada a adolescentes y adultos. Tratamiento de ansiedad, depresión, estrés laboral y apoyo emocional.', 
  60, 
  60.00
)
ON CONFLICT (id) DO NOTHING;

-- Insertar horarios disponibles por defecto para la Dra. Sofía Alcaide (Lunes a Viernes de 09:00 a 18:00)
INSERT INTO availability (therapist_id, day_of_week, start_time, end_time)
VALUES 
  (1, 1, '09:00:00', '18:00:00'), -- Lunes
  (1, 2, '09:00:00', '18:00:00'), -- Martes
  (1, 3, '09:00:00', '18:00:00'), -- Miércoles
  (1, 4, '09:00:00', '18:00:00'), -- Jueves
  (1, 5, '09:00:00', '18:00:00')  -- Viernes
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Reiniciar la secuencia de los IDs para evitar desfases en inserciones futuras
SELECT setval('therapists_id_seq', COALESCE((SELECT MAX(id)+1 FROM therapists), 1), false);
SELECT setval('services_id_seq', COALESCE((SELECT MAX(id)+1 FROM services), 1), false);
