import React from 'react'

export default function Modal({ children, title, onClose }){
  return (
    <div className="modal">
      <div className="box">
        <div className="modal-header">
          <h3>{title}</h3>
          <div>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
