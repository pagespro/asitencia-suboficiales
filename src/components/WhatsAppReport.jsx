import { useState } from 'react'

function WhatsAppReport({ attendance, stats, onBack, onLogout }) {
  const [copied, setCopied] = useState(false)

  const generateReport = () => {
    const today = new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let report = `📋 ASISTENCIA DIARIA\n`
    report += `📅 ${today}\n`
    report += `\n─────────────────────────\n`
    report += `✓ Presentes: ${stats.presentes}\n`
    report += `✕ Ausentes: ${stats.ausentes}\n`
    report += `! Con Novedades: ${stats.con_novedades}\n`
    report += `─────────────────────────\n\n`

    const novedades = attendance.filter(a => a.novedad_tipo !== 'sin novedad')
    if (novedades.length > 0) {
      report += `📌 NOVEDADES:\n`
      novedades.forEach(record => {
        report += `• ${record.nombre} ${record.apellido}\n`
        if (record.novedad_tipo === 'otros' && record.novedad_descripcion) {
          report += `  Motivo: ${record.novedad_descripcion}\n`
        } else {
          report += `  ${record.novedad_tipo}\n`
        }
      })
    } else {
      report += `✓ Sin novedades\n`
    }

    return report
  }

  const report = generateReport()

  const handleCopy = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(report)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Generar Reporte</h1>
          <button
            onClick={onLogout}
            className="bg-danger hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6 card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reporte WhatsApp</h2>

          <div className="bg-gray-100 rounded-lg p-4 mb-6 font-mono text-sm whitespace-pre-wrap break-words">
            {report}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                copied ? 'bg-success' : 'bg-primary hover:bg-opacity-90'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar al Portapapeles'}
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full btn-secondary"
            >
              Enviar por WhatsApp
            </button>

            <button
              onClick={onBack}
              className="w-full bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-all"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppReport