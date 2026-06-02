-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: aspirantes
CREATE TABLE IF NOT EXISTS aspirantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  anio INTEGER NOT NULL CHECK (anio IN (1, 2)),
  grupo VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: situaciones (Reference table)
CREATE TABLE IF NOT EXISTS situaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
);

-- Table: novedades_tipos (Reference table)
CREATE TABLE IF NOT EXISTS novedades_tipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
);

-- Table: asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aspirante_id UUID NOT NULL REFERENCES aspirantes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) NOT NULL DEFAULT 'presente' CHECK (estado IN ('presente', 'ausente')),
  situacion VARCHAR(50) NOT NULL,
  novedad_tipo VARCHAR(50) NOT NULL DEFAULT 'sin novedad',
  novedad_descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aspirante_id, fecha)
);

-- Table: reportes (For audit and history)
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  instructor_nombre VARCHAR(100),
  total_presentes INTEGER,
  total_ausentes INTEGER,
  contenido_reporte TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert reference data
INSERT INTO situaciones (nombre, descripcion) VALUES
('pasantia', 'En pasantía'),
('contraturno', 'En contraturno'),
('guardia', 'En guardia'),
('franco', 'Día franco')
ON CONFLICT DO NOTHING;

INSERT INTO novedades_tipos (nombre, descripcion) VALUES
('sin novedad', 'Sin novedad'),
('parte medico', 'Parte médico'),
('permiso', 'Permiso'),
('autorizacion', 'Autorización'),
('otros', 'Otros motivos')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_asistencias_aspirante_id ON asistencias(aspirante_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_asistencias_aspirante_fecha ON asistencias(aspirante_id, fecha);
CREATE INDEX idx_aspirantes_dni ON aspirantes(dni);
CREATE INDEX idx_reportes_fecha ON reportes(fecha);

-- Enable Row Level Security (Optional, for multi-tenancy)
ALTER TABLE aspirantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

-- Views for convenience
CREATE OR REPLACE VIEW vista_asistencia_diaria AS
SELECT 
  a.id,
  asp.dni,
  asp.nombre,
  asp.apellido,
  asp.anio,
  a.fecha,
  a.estado,
  a.situacion,
  a.novedad_tipo,
  a.novedad_descripcion,
  a.hora
FROM asistencias a
JOIN aspirantes asp ON a.aspirante_id = asp.id
WHERE a.fecha = CURRENT_DATE
ORDER BY a.hora DESC;

CREATE OR REPLACE VIEW resumen_diario AS
SELECT 
  CURRENT_DATE as fecha,
  COUNT(CASE WHEN estado = 'presente' THEN 1 END) as presentes,
  COUNT(CASE WHEN estado = 'ausente' THEN 1 END) as ausentes,
  COUNT(CASE WHEN novedad_tipo != 'sin novedad' THEN 1 END) as con_novedades
FROM asistencias
WHERE fecha = CURRENT_DATE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aspirantes_update_timestamp 
BEFORE UPDATE ON aspirantes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER asistencias_update_timestamp 
BEFORE UPDATE ON asistencias
FOR EACH ROW EXECUTE FUNCTION update_timestamp();