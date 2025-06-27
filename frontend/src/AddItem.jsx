import { Menu, Transition, Dialog } from '@headlessui/react'
import { Fragment, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { FolderPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

import {InputText} from './components/InputText'
import { ButtonPrimary, ButtonSecondary } from './components/Button'

import { API_NEW_FILE, API_NEW_FOLDER } from './const'
import { createDir } from './services/files'


const AddItemModal = forwardRef(({ onSuccess, path }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalData, setModalData] = useState({ type: '' }) // add-folder, add-file 
  const inputRef = useRef()

  const closeModal = () => setIsOpen(false)

  const openModal = (data = {}) => {
    setModalData({ type: data.type || 'add-folder' })
    setIsOpen(true)
  }

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }))

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleSave = async () => {
    const name = inputRef.current?.value?.trim()
    if (name && onSuccess) {
      const api = modalData.type == 'add-folder' ? API_NEW_FOLDER : API_NEW_FILE;

      createDir(path, name, api, onSuccess, alert);
    }
    closeModal()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {modalData.type === 'add-folder' ? 'New Folder' : 'New File'}
                </Dialog.Title>

                <div className="mt-2">
                  <InputText
                    ref={inputRef}
                    type="text"
                    placeholder={modalData.type === 'add-folder' ? 'Folder Name' : 'newfile.txt'}
                    className="w-full px-4 py-2 text-sm"
                    // 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSave()
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-2 mt-4">
                  <ButtonSecondary onClick={closeModal} className="px-3 py-2 text-sm">
                    Cancel
                  </ButtonSecondary>
                  <ButtonPrimary onClick={handleSave} className="px-3 py-2 text-sm">
                    Save
                  </ButtonPrimary>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
})


export default function AddItem({ path, onSuccess }) {
  const modalRef = useRef()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          title="Add New"
        >
          <FolderPlusIcon className="w-6 h-6 inline" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => modalRef.current.openModal({ type: 'add-folder' })}
                  className={`${
                    active
                      ? 'bg-violet-500 text-white'
                      : 'text-gray-900 dark:text-gray-100'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <FolderPlusIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Folder
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => modalRef.current.openModal({ type: 'add-file' })}
                  className={`${
                    active
                      ? 'bg-violet-500 text-white'
                      : 'text-gray-900 dark:text-gray-100'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <DocumentTextIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  File
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>

      <AddItemModal ref={modalRef} onSuccess={onSuccess} path={path} />
    </Menu>
  )
}
