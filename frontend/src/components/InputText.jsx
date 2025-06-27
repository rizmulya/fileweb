import { forwardRef } from 'react'

export const InputText = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={
        'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800 dark:text-gray-100 ' +
        className
      }
      {...props}
    />
  )
})

export const Textarea = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={
        'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800 dark:text-gray-100 ' +
        className
      }
      {...props}
    />
  )
})