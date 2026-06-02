function AttendanceTable({ attendance }) {
  const getNoviedadBadgeClass = (novedad_tipo) => {
    switch (novedad_tipo) {
      case 'sin novedad':
        return 'badge badge-success'
      case 'parte medico':
        return 'badge badge-danger'
      case 'permiso':
        return 'badge badge-warning'
      case 'autorizacion':
        return 'badge badge-info'
      case 'otros':
        return 'badge badge-warning'
      default:
        return 'badge badge-info'
    }
  }

  const formatNovedad = (tipo, descripcion) => {
    if (tipo === 'sin novedad') return 'Sin novedad'
    if (tipo === 'otros' && descripcion) return `${tipo}: ${descripcion}`
    return tipo.charAt(0).toUpperCase() + tipo.slice(1)
  }

  if (attendance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No hay registros de asistencia hoy</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">DNI</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Año</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Situación</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Novedad</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendance.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {record.nombre} {record.apellido}
                </td>
                <td className="px-4 py-3 text-gray-600">{record.dni}</td>
                <td className="px-4 py-3 text-center">
                  <span className="badge bg-primary bg-opacity-20 text-primary">
                    Año {record.anio}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {record.situacion.replace('_', ' ')}
                </td>
                <td className="px-4 py-3">
                  <span className={getNoviedadBadgeClass(record.novedad_tipo)}>
                    {formatNovedad(record.novedad_tipo, record.novedad_descripcion)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {new Date(record.hora).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceTable