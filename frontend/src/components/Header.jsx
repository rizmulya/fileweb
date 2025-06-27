import { Fragment, useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { FolderOpenIcon, SunIcon, MoonIcon, MagnifyingGlassIcon, ArrowUpTrayIcon,CheckCircleIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react'

import {InputText} from './InputText';
import ProgressBar from './ProgressBar';

import { API_UPLOAD } from '../const';
import { uploadFiles } from '../services/files';


const UploadModal = forwardRef(({ 
  path, 
  onSuccess = () => {}
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filesInfo, setFilesInfo] = useState(null);
  // const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
    setFilesInfo(null);
    // setFiles([]);
    setUploading(false);
    setProgress(0);
    setSuccess(false);
  };

  const openModal = () => setIsOpen(true);

  useImperativeHandle(ref, () => ({ openModal, closeModal }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    // setFiles(selected);

    if (selected.length === 0) {
      setFilesInfo(null);
    } else if (selected.length === 1) {
      setFilesInfo(selected[0].name);
    } else {
      setFilesInfo(`${selected.length} selected`);
    }

    handleUpload(selected);
  };

  const handleUpload = (filesToUpload) => {
    setUploading(true);
    setProgress(0);

    uploadFiles({
      files: filesToUpload,
      path,
      onProgress: setProgress,
      onSuccess: () => {
        setUploading(false);
        setSuccess(true);
        setTimeout(closeModal, 1000);
        onSuccess(); // from props
      },
      onError: (msg) => {
        setUploading(false);
        alert(msg);
      }
    });
  };

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">

                {success ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
                    <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">files uploaded successfully</h2>
                  </div>
                ) : (
                  <>
                    <label htmlFor="uploadFile"
                      className="bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-300 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 dark:border-gray-500 border-dashed mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-11 mb-3 fill-gray-500" viewBox="0 0 32 32">
                        <path
                          d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                          data-original="#000000" />
                        <path
                          d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                          data-original="#000000" />
                      </svg>
                      Choose file
                      <input
                        type="file"
                        id="uploadFile"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                      <p className="text-xs font-medium text-slate-400 dark:text-gray-300 mt-2">PNG, JPG, PDF, DOCX, more.</p>
                    </label>

                    {filesInfo && (
                      <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-4">
                        {filesInfo}
                      </p>
                    )}

                    {uploading && (
                      <div className="mt-3 max-w-md mx-auto">
                        <ProgressBar progress={progress} />
                      </div>
                    )}
                  </>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default function Header({ search, setSearch, path, fetchEntries }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const modalRef = useRef()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpenIcon className="w-6 h-6 text-gray-500" />
          File Web
        </h1>

        <button
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:ring-2 hover:ring-blue-400 transition"
          onClick={toggleTheme}
        >
          {isDark ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <InputText 
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-sm pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Upload button */}
        <button
          className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-sm shadow w-10 sm:w-auto"
          title="Upload File"
          onClick={() => modalRef.current.openModal()}
        >
          <ArrowUpTrayIcon className="w-5 h-5"  />
          <span className="hidden sm:inline">Upload File</span>
        </button>
      </div>

      <UploadModal ref={modalRef} path={path} onSuccess={() => fetchEntries(path, false)} />
    </div>
  );
}
