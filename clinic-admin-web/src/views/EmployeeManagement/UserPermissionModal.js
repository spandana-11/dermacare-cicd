import React from 'react'

const UserPermissionModal = ({
  show,
  onClose,
  features,
  actions,
  permissions,
  toggleFeature,
  toggleAllActions,
  togglePermission,
  onSave,
}) => {
  if (!show) return null // don't render if modal is hidden

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Set User Permissions</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {features.map((feature) => {
                  const isFeatureChecked = !!permissions[feature]
                  const allSelected =
                    isFeatureChecked && permissions[feature].length === actions.length

                  return (
                    <div key={feature} className="col-md-5 mb-3 border p-2 rounded mx-4">
                      {/* Feature Checkbox */}
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="fw-bold">
                          <input
                            type="checkbox"
                            checked={isFeatureChecked}
                            onChange={() => toggleFeature(feature)}
                          />{' '}
                          {feature}
                        </label>

                        {/* Select All */}
                        <label>
                          <input
                            type="checkbox"
                            disabled={!isFeatureChecked}
                            checked={allSelected}
                            onChange={() => toggleAllActions(feature)}
                          />{' '}
                          Select All
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="d-flex flex-wrap gap-3 mt-2">
                        {actions.map((action) => (
                          <label key={action} className="d-flex align-items-center gap-1">
                            <input
                              type="checkbox"
                              disabled={!isFeatureChecked}
                              checked={permissions[feature]?.includes(action) || false}
                              onChange={() => togglePermission(feature, action)}
                            />
                            {action}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={onSave}>
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export default UserPermissionModal