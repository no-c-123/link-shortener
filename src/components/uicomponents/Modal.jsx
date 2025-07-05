// src/components/uicomponents/Modal.jsx
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, transitionName }) => {
    useEffect(() => {
        if (isOpen && document.startViewTransition) {
            document.startViewTransition(() => {});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex justify-center items-center z-50 transition-all duration-300">
            <div
                className="bg-zinc-800 p-6 rounded-lg w-[50vw] max-w-md text-white relative shadow-lg flex flex-col"
                style={{ viewTransitionName: transitionName }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white text-xl hover:text-gray-400"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;