import React from 'react'

import { CCard, CCardBody, CCardFooter, CCol, CRow } from '@coreui/react'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          ></CRow>
        </CCardFooter>
      </CCard>
      <WidgetsBrand className="mb-4" withCharts />
      <CRow>
        <CCol xs>
          <CCardBody>
            <CRow>
              <CCol xs={12} md={6} xl={6}></CCol>
              <CCol xs={12} md={6} xl={6}>
                <hr className="mt-0" />
                <div className="mb-5"></div>
              </CCol>
            </CRow>
            <br />
          </CCardBody>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
