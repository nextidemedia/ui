import * as React from "react"

// Text inputs also match :focus-visible after a pointer click.
function useFieldFocus<T extends HTMLElement>(props: React.DOMAttributes<T>) {
  const [pointerFocus, setPointerFocus] = React.useState(false)
  return {
    "data-pointer-focus": pointerFocus || undefined,
    onPointerDownCapture(event: React.PointerEvent<T>) {
      setPointerFocus(true)
      props.onPointerDownCapture?.(event)
    },
    onKeyDownCapture(event: React.KeyboardEvent<T>) {
      if (event.key === "Tab") setPointerFocus(false)
      props.onKeyDownCapture?.(event)
    },
    onBlurCapture(event: React.FocusEvent<T>) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setPointerFocus(false)
      }
      props.onBlurCapture?.(event)
    },
  }
}

export { useFieldFocus }
