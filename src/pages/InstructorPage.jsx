import { useState, useEffect } from 'react'
import { supabase } from '../App'
import DashboardStats from '../components/DashboardStats'
import AttendanceTable from '../components/AttendanceTable'
import WhatsAppReport from '../components/WhatsAppReport'

function InstructorPage({ onLogout }) {
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ presentes: 0, ausentes: 0, con_novedades: 0 })
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [selectedYear, setSelectedYear] = useState('todos')

  useEffect(() => {
    fetchAttendanceData()
    const subscription = supabase
      .channel('asistencias_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asistencias'
        },
        (payload) => {
          fetchAttendanceData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedYear])

  const fetchAttendanceData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('vista_asistencia_diaria')
        .select('*')
        .eq('fecha', today)

      if (selectedYear !== 'todos') {
        query = query.eq('anio', parseInt(selectedYear))
      }

      const { data, error } = await query.order('hora', { ascending: false })

      if (error) throw error

      setAttendance(data || [])

      const presentes = data?.filter(a => a.estado === 'presente').length || 0
      const ausentes = data?.filter(a => a.estado === 'ausente').length || 0
      const con_novedades = data?.filter(a => a.novedad_tipo !== 'sin novedad').length || 0

      setStats({ presentes, ausentes, con_novedades })
    } catch (error) {
      console.error('Error fetching attendance:', error)
      alert('Error al cargar los datos de asistencia')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-primary">Cargando datos...</div>
      </div>
    )
  }

  if (showReport) {
    return (
      <WhatsAppReport
        attendance={attendance}
        stats={stats}
        onBack={() => setShowReport(false)}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Panel de Instructor</h1>
          <button
            onClick={onLogout}
            className="bg-danger hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filtrar por año:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-base max-w-xs"
          >
            <option value="todos">Todos los años</option>
            <option value="1">Primer año</option>
            <option value="2">Segundo año</option>
          </select>
        </div>

        <DashboardStats stats={stats} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Asistencia Diaria</h2>
          <AttendanceTable attendance={attendance} />
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setShowReport(true)}
            className="btn-secondary flex-1"
          >
            Generar Reporte WhatsApp
          </button>
          <button
            onClick={fetchAttendanceData}
            className="btn-primary flex-1"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstructorPage