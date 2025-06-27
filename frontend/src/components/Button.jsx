

export function ButtonPrimary({ className = '', children, ...props }) {
  return (
    <button
      className={
        'inline-flex justify-center bg-violet-600 text-white rounded-md hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonSecondary({ className = '', children, ...props }) {
  return (
    <button
      className={
        'inline-flex justify-center rounded-md border ' +
        'border-violet-600 text-violet-600 bg-white hover:bg-violet-50 ' +
        'dark:border-violet-500 dark:text-violet-500 dark:bg-gray-800 dark:hover:bg-gray-700 ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  )
}