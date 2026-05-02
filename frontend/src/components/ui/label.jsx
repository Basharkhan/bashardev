function Label({ className = '', ...props }) {
  return <label data-slot="label" className={`text-sm font-medium text-white/75 ${className}`.trim()} {...props} />
}

export { Label }
