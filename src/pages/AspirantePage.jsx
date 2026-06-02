import { useState, useEffect } from 'react'
import { supabase } from '../App'
import DNISearch from '../components/DNISearch'
import AttendanceForm from '../components/AttendanceForm'
import ConfirmationMessage from '../components/ConfirmationMessage'

function AspirantePage({ onLogout }) {
  const [aspirant, setAspirant] = useState(null)
  const [hasRegisteredToday, setHasRegisteredToday] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDNISubmit = async (dni) => {
    setLoading(true)
    try {
      const { data: aspirantData, error: aspirantError } = await supabase
        .from('aspirantes')
        .select('*')
        .eq('dni', dni)
        .single()

      if (aspirantError) {
        alert('Aspirante no encontrado. Verifique su DNI.')
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: existingAttendance } = await supabase
        .from('asistencias')
        .select('*')
        .eq('aspirante_id', aspirantData.id)
        .eq('fecha', today)
        .single()

      if (existingAttendance) {
        setHasRegisteredToday(true)
        alert('Ya has registrado tu asistencia hoy. ¿Deseas actualizar tu registro?')
      }

      setAspirant(aspirantData)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al buscar aspirante')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceSubmit = async (formData) => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()

      if (hasRegisteredToday) {
        const { error } = await supabase
          .from('asistencias')
          .update({
            situacion: formData.situacion,
            novedad_tipo: formData.novedad_tipo,
            novedad_descripcion: formData.novedad_descripcion,
            updated_at: now
          })
          .eq('aspirante_id', aspirant.id)
          .eq('fecha', today)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('asistencias')
          .insert([
            {
              aspirante_id: aspirant.id,
              fecha: today,
              hora: now,
              estado: 'presente',
              situacion: formData.situacion,
              novedad_tipo: formData.novedad_tipo,
              novedad_descripcion: formData.novedad_descripcion
            }
          ])

        if (error) throw error
      }

      setShowConfirmation(true)
      setTimeout(() => {
        resetForm()
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar asistencia')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAspirant(null)
    setHasRegisteredToday(false)
    setShowConfirmation(false)
  }

  if (showConfirmation) {
    return <ConfirmationMessage aspirant={aspirant} />
  }

  if (!aspirant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center p-4">
        <DNISearch onSubmit={handleDNISubmit} loading={loading} onLogout={onLogout} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{aspirant.nombre} {aspirant.apellido}</h1>
            <p className="text-sm text-blue-200">DNI: {aspirant.dni}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-danger hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-6">
        <AttendanceForm
          aspirant={aspirant}
          onSubmit={handleAttendanceSubmit}
          loading={loading}
          isUpdate={hasRegisteredToday}
        />
      </div>
    </div>
  )
}

export default AspirantePage