import React from 'react'
import PropTypes from 'prop-types'
import { CWidgetStatsD, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cibFacebook, cibLinkedin, cibTwitter, cilCalendar } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'

const WidgetsBrand = (props) => {
  const chartOptions = {
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }

  return (
   
  <CCol sm={12} xl={12} xxl={12}>
    <CWidgetStatsD
      {...(props.withCharts && {
        chart: (
          <CChart
            className="position-absolute w-100 h-100"
           
            type="bar"
            data={{
              labels: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ],
              datasets: [
                {
                  label: 'Monthly Earnings',
                  backgroundColor: '#36A2EB',
                  borderColor: '#1E88E5',
                  borderWidth: 1,
                  barThickness: 28,
                  maxBarThickness: 40,
                  data: [1200, 1900, 3000, 2500, 2200, 2800, 3200, 3100, 3300, 3500, 3700, 3900],
                },
                {
                  label: 'Yearly Earnings',
                  backgroundColor: '#FF6384',
                  borderColor: '#FF6384',
                  borderWidth: 1,
                  barThickness: 28,
                  maxBarThickness: 40,
                  data: [14400, 22800, 36000, 30000, 26400, 33600, 38400, 37200, 39600, 42000, 44400, 46800],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  labels: { color: '#fff' },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `$${context.parsed.y}`,
                  },
                },
              },
              scales: {
                x: {
                  stacked: false,
                  ticks: { color: '#fff' },
                  grid: { display: false },
                  barPercentage: 0.9,
                  categoryPercentage: 0.8,
                },
                y: {
                  ticks: { color: '#fff' },
                  beginAtZero: true,
                  suggestedMax: 10000, // Controls max Y-axis value
                },
              },
              maintainAspectRatio: false,
            }}
          />
        ),
      })}
      icon={<CIcon height={200} className="my-4 text-white" />}
      values={[
        { title: 'Monthly Earnings', value: '$38.4K' },
        { title: 'Yearly Earnings', value: '$450K' },
      ]}
      style={{
        '--cui-card-cap-bg': '#3b5998',
      }}
    />
  </CCol>


  
  )
}


WidgetsBrand.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}


export default WidgetsBrand
