import React, { useState } from 'react'
import { CTabs, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'

import MedicineTemplate from '../PharmacyManagement/MedicineTemplate'
import Inventory from '../PharmacyManagement/Inventory'
import OPSales from '../PharmacyManagement/OPSales'
import SalesReturns from '../PharmacyManagement/SalesReturns'
import Purchases from '../PharmacyManagement/Purchases'
import StockReturns from '../PharmacyManagement/StockReturns'
import MoneyReceipts from '../PharmacyManagement/MoneyReceipts'

const PharmacyManagement = () => {
  const [activeKey, setActiveKey] = useState(0)

  return (
    <div className="pharmacy-management p-4 w-100">
      <h5 className="pm-title mb-4">Pharmacy Management</h5>

      <CTabs activeKey={activeKey}>
        <CNav variant="tabs" className="pm-tabs">
          <CNavItem>
            <CNavLink active={activeKey === 0} onClick={() => setActiveKey(0)}>
              Medicine Template
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Inventory
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              OP Sales
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Sales Returns
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>
              Purchases
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 5} onClick={() => setActiveKey(5)}>
              Stock Returns
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 6} onClick={() => setActiveKey(6)}>
              Money Receipts
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent className="mt-3">
          <CTabPane visible={activeKey === 0}>
            <MedicineTemplate />
          </CTabPane>
          <CTabPane visible={activeKey === 1}>
            <Inventory />
          </CTabPane>
          <CTabPane visible={activeKey === 2}>
            <OPSales />
          </CTabPane>
          <CTabPane visible={activeKey === 3}>
            <SalesReturns />
          </CTabPane>
          <CTabPane visible={activeKey === 4}>
            <Purchases />
          </CTabPane>
          <CTabPane visible={activeKey === 5}>
            <StockReturns />
          </CTabPane>
          <CTabPane visible={activeKey === 6}>
            <MoneyReceipts />
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  )
}

export default PharmacyManagement
