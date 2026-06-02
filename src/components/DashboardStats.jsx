function DashboardStats({ stats }) {
  const statCards = [
    {
      label: 'Presentes',
      value: stats.presentes,
      color: 'bg-success',
      icon: '✓'
    },
    {
      label: 'Ausentes',
      value: stats.ausentes,
      color: 'bg-danger',
      icon: '✕'
    },
    {
      label: 'Con Novedades',
      value: stats.con_novedades,
      color: 'bg-warning',
      icon: '!'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.color} text-white rounded-lg shadow-lg p-6`}>
          <div className="text-5xl font-bold mb-2 text-center">
            {stat.value}
          </div>
          <div className="text-center text-sm font-semibold">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats