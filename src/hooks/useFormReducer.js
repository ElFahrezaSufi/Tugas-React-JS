import { useReducer } from 'react';

/**
 * Custom hook menggunakan useReducer untuk manage form state yang kompleks
 * Ini adalah contoh implementasi useReducer untuk form management
 */

// Action types
export const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERRORS: 'SET_ERRORS',
  RESET_FORM: 'RESET_FORM',
  LOAD_DATA: 'LOAD_DATA',
  SET_SUBMITTING: 'SET_SUBMITTING',
};

// Reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    
    case FORM_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.message,
        },
      };
    
    case FORM_ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors,
      };
    
    case FORM_ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors,
      };
    
    case FORM_ACTIONS.RESET_FORM:
      return {
        ...state,
        formData: action.initialData || state.initialData,
        errors: {},
      };
    
    case FORM_ACTIONS.LOAD_DATA:
      return {
        ...state,
        formData: action.data,
        errors: {},
      };
    
    case FORM_ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.value,
      };
    
    default:
      return state;
  }
};

/**
 * Custom hook untuk form dengan useReducer
 * @param {Object} initialData - Initial form data
 * @returns {Object} - { formData, errors, isSubmitting, dispatch, handlers }
 */
export const useFormReducer = (initialData) => {
  const [state, dispatch] = useReducer(formReducer, {
    formData: initialData,
    initialData: initialData,
    errors: {},
    isSubmitting: false,
  });

  // Helper handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    dispatch({ type: FORM_ACTIONS.SET_FIELD, field: name, value: finalValue });
  };

  const handlers = {
    setField: (field, value) => {
      dispatch({ type: FORM_ACTIONS.SET_FIELD, field, value });
    },
    
    setError: (field, message) => {
      dispatch({ type: FORM_ACTIONS.SET_ERROR, field, message });
    },
    
    handleChange,
    
    clearError: (field) => {
      dispatch({ type: FORM_ACTIONS.CLEAR_ERROR, field });
    },
    
    setErrors: (errors) => {
      dispatch({ type: FORM_ACTIONS.SET_ERRORS, errors });
    },
    
    resetForm: (data) => {
      dispatch({ type: FORM_ACTIONS.RESET_FORM, initialData: data });
    },
    
    loadData: (data) => {
      dispatch({ type: FORM_ACTIONS.LOAD_DATA, data });
    },
    
    setSubmitting: (value) => {
      dispatch({ type: FORM_ACTIONS.SET_SUBMITTING, value });
    },
  };

  // Memoize the return value to prevent unnecessary re-renders
  return {
    formData: state.formData,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    dispatch,
    ...handlers,
  };
};

export default useFormReducer;
