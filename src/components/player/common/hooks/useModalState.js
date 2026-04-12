import { useReducer } from "react";

const OPEN = "OPEN";
const CLOSE = "CLOSE";

function modalReducer(state, action) {
  switch (action.type) {
    case OPEN:
      return {
        modalName: action.modalName,
        data: action.data ?? null,
      };
    case CLOSE:
      return { modalName: null, data: null };
    default:
      return state;
  }
}

const initialState = { modalName: null, data: null };

/**
 * General-purpose single-modal state manager using useReducer.
 *
 * Only one modal can be open at a time, identified by a string name.
 * Optional `data` can be attached when opening (e.g. the item being edited).
 *
 * @returns {{
 *   isOpen: (modalName: string) => boolean,
 *   openModal: (modalName: string, data?: any) => void,
 *   closeModal: () => void,
 *   modalData: any,
 *   activeModal: string | null,
 * }}
 */
export function useModalState() {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  const isOpen = (modalName) => state.modalName === modalName;

  const openModal = (modalName, data) =>
    dispatch({ type: OPEN, modalName, data });

  const closeModal = () => dispatch({ type: CLOSE });

  return {
    isOpen,
    openModal,
    closeModal,
    modalData: state.data,
    activeModal: state.modalName,
  };
}
