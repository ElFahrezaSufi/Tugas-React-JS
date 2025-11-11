import { useReducer, useCallback, useMemo } from "react";

export const FORM_ACTIONS = {
  SET_FIELD: "SET_FIELD",
  SET_ERRORS: "SET_ERRORS",
  RESET_FORM: "RESET_FORM",
  SET_SUBMITTING: "SET_SUBMITTING",
};

const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case FORM_ACTIONS.SET_ERRORS:
      return { ...state, errors: action.errors || {} };
    case FORM_ACTIONS.RESET_FORM:
      return { ...state, formData: action.payload, errors: {} };
    case FORM_ACTIONS.SET_SUBMITTING:
      return { ...state, isSubmitting: action.value };
    default:
      return state;
  }
};

export default function useFormReducer(initialData) {
  const [state, dispatch] = useReducer(formReducer, {
    formData: initialData,
    errors: {},
    isSubmitting: false,
  });

  const setField = useCallback(
    (field, value) => dispatch({ type: FORM_ACTIONS.SET_FIELD, field, value }),
    []
  );

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: FORM_ACTIONS.SET_FIELD,
      field: name,
      value: type === "checkbox" ? checked : value,
    });
  }, []);

  const setErrors = useCallback(
    (errors) => dispatch({ type: FORM_ACTIONS.SET_ERRORS, errors }),
    []
  );

  const resetForm = useCallback(
    (data = initialData) =>
      dispatch({ type: FORM_ACTIONS.RESET_FORM, payload: data }),
    [initialData]
  );

  const setSubmitting = useCallback(
    (value) => dispatch({ type: FORM_ACTIONS.SET_SUBMITTING, value }),
    []
  );

  return useMemo(
    () => ({
      formData: state.formData,
      errors: state.errors,
      isSubmitting: state.isSubmitting,
      setField,
      setFieldValue: setField, // ✅ alias tetap ada
      handleChange,
      setErrors,
      resetForm,
      setSubmitting,
    }),
    [state, setField, handleChange, setErrors, resetForm, setSubmitting]
  );
}
