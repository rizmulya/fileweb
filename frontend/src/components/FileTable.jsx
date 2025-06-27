import  { useState, useEffect, useRef, Fragment, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import {  PencilIcon, DocumentTextIcon, SpeakerWaveIcon, PhotoIcon, PlayCircleIcon, ArchiveBoxIcon, CodeBracketIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Textarea } from './InputText';
import { PdfIcon, DocxIcon, XlsxIcon, PptxIcon} from './Icons';

import { API_WRITE_FILE, API_RENAME_DIR } from '../const';
import { fromBase64, limitStr, getFileHref, isEditableFile, getFileType, debounce } from '../utils';
import { getPlainTextFileContent, writeFile } from '../services/files';


function renderFileIcon(type) {
  switch (type) {
    case "pdf": return <PdfIcon className="w-6 h-6" />;
    case "doc": return <DocxIcon className="w-6 h-6" />;
    case "xls": return <XlsxIcon className="w-6 h-6" />;
    case "ppt": return <PptxIcon className="w-6 h-6" />;
    case "img": return <PhotoIcon className="w-6 h-6" />;
    case "video": return <PlayCircleIcon className="w-6 h-6" />;
    case "audio": return <SpeakerWaveIcon className="w-6 h-6" />;
    case "archive": return <ArchiveBoxIcon className="w-6 h-6" />;
    case "code": return <CodeBracketIcon className="w-6 h-6" />;
    case "bin": return <CodeBracketIcon className="w-6 h-6" />;
    case "text": return <DocumentTextIcon className="w-6 h-6" />;
    default: return <DocumentTextIcon className="w-6 h-6" />;
  }
}


const EditContentModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({ path: '', name: '' });
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
    setModalData({ path: '', name: '' });
    setContent('');
    setSaved(false);
  };

  const inputRef = useRef();
  const pathRef = useRef('');// fix modalData.path

  const openModal = async (data = {}) => {
    pathRef.current = data.path;
    setModalData({ path: data.path, name: data.name });
    setIsOpen(true);

    getPlainTextFileContent(
      data.path,
      (text) => setContent(text),
      alert
    );
  };

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }));

  useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      }
    }, [isOpen])
    

  const handleInput = useCallback(
    debounce(async (e) => {

      writeFile(
        pathRef.current,
        e.target.value,
        () => {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
          }, 2000);
        },
        alert
       );
      
    }, 500),
    []
  );

  const handleChange = (e) => {
    setContent(e.target.value);
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
          <div className="flex min-h-full items-center justify-center p-0 md:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="flex justify-between text-gray-900 dark:text-gray-100"
                >
                  <div className="flex">
                    <span className="text-lg font-semibold leading-6">
                      {modalData.name}
                    </span>
                    {saved && (
                      <div className="ml-3 flex items-center text-sm font-semibold text-violet-700 dark:text-violet-400">
                        <CheckCircleIcon className="w-5 h-5" /> Saved!
                      </div>
                    )}
                  </div>
                  <div className="inline cursor-pointer lg:hidden" onClick={closeModal}>
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                </Dialog.Title>
                <div className="mt-4">
                  <Textarea
                    ref={inputRef}
                    className="w-full p-3 md:p-4"
                    rows={20}
                    value={content}
                    onChange={handleChange}
                    onInput={handleInput}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default function FileTable({
  entries,
  setPath,
  selected,
  onSelect,
  search,
  path
}) {
  // edit filename
  const [editingPath, setEditingPath] = useState(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef(null);

  const handleFrontendEditFileName = async (oldName, newName) => {
    const trimmed = newName.trim();
  
    if (oldName === trimmed) {
      setEditingPath(null);
      return;
    }
  
    const nameExists = entries.some(
      (e) => e.name === trimmed && e.name !== oldName
    );
  
    if (nameExists) {
      console.warn(`Nama "${trimmed}" sudah digunakan. Gagal mengganti "${oldName}".`);
      setEditingPath(null);
      return;
    }

    const dir = fromBase64(path);
    const oldPath = `${dir}/${oldName}`;
    const newPath = `${dir}/${trimmed}`;

    const isSuccess = await handleRenameDir(oldPath, newPath);
    if (!isSuccess) {
      setEditingPath(null);
      alert("Rename failed!");
      return;
    }

    setPath(path, false);
    // setEntries(prev =>
    //   prev.map(e =>
    //     e.name === oldName ? { ...e, name: trimmed } : e
    //   )
    // );
  };

  const handleRenameDir = async (oldPath, newPath) => {
      try {
        const res = await fetch(API_RENAME_DIR, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oldPath, newPath }),
        });

        if (!res.ok) {
          throw new Error('Failed to Rename');
        }

        return true;
      } catch (error) {
        console.error('Rename error:', error);
        return false;
      }
    }
  

  // const handleFrontendDelete = (name) => {
  //   setEntries(prev => prev.filter(e => e.name !== name));
  // };

  const filtered = entries.filter(entry =>
    entry.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (entryPath) => selected.includes(entryPath);

  const toggleAll = (e) => {
    if (e.target.checked) {
      const allPaths = filtered.map(e => e.path);
      allPaths.forEach(p => !selected.includes(p) && onSelect(p, true));
    } else {
      filtered.forEach(e => onSelect(e.path, false));
    }
  };

  const modalRef = useRef()

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] sm:min-w-[1102px] inline-block overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={filtered.length > 0 && filtered.every(e => selected.includes(e.path))}
                  className="form-checkbox rounded text-blue-600"
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">Size</th>
              <th className="px-4 py-2 text-right pr-4 font-medium text-gray-600 dark:text-gray-300"><div className="w-[5px]"></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((entry) => (
              <tr key={entry.path} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected(entry.path)}
                    onChange={(e) => onSelect(entry.path, e.target.checked)}
                    className="form-checkbox rounded text-blue-600"
                  />
                </td>
                <td
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (entry.is_dir) {
                      setPath(entry.path);
                    } else if (entry.ext && isEditableFile(entry.ext)) {
                      modalRef.current.openModal({ path: entry.path, name: entry.name });
                    } else {
                      window.open(getFileHref(entry), '_self');
                    }
                  }}
                >
                  <div className="w-full flex items-center gap-2 text-left px-2 py-1 rounded">
                    {entry.is_dir ? (
                      <svg className="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <svg className="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                        </svg>
                      </svg>
                    ) : (
                      renderFileIcon(getFileType(entry.name))
                    )}

                    {editingPath === entry.path ? (
                      <input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleFrontendEditFileName(entry.name, newName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') inputRef.current.blur();
                        }}
                        onClick={(e) => e.stopPropagation()} // ⛔ cegah trigger td
                        className="bg-transparent border-b border-blue-500 focus:outline-none font-medium w-full text-blue-600 dark:text-blue-300"
                      />
                    ) : (
                      <span className="w-full text-left font-medium">
                        {limitStr(entry.name)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-300">
                  {entry.is_dir ? '—' : entry.size}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="text-gray-600 dark:text-gray-300 hover:text-yellow-600" 
                      onClick={() => {
                        setEditingPath(entry.path);
                        setNewName(entry.name);
                      }}
                      title="Rename"
                    >
                        <PencilIcon className="w-5 h-5 inline"  />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No files or folders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <EditContentModal ref={modalRef} />
      </div>
    </div>
  );
}