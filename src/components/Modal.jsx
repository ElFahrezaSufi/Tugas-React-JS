import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Modal = forwardRef(({ children, onClose, title }, ref) => {
  const modalRef = useRef();

  useImperativeHandle(ref, () => ({
    show: () => modalRef.current?.showModal(),
    close: () => {
      modalRef.current?.close();
      onClose?.();
    }
  }));

  return (
    <dialog 
      ref={modalRef} 
      className="modal"
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      onClick={(e) => e.target === modalRef.current && onClose?.()}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  );
});

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string
};

export default Modal;
