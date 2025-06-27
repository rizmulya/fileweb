import { useEffect, useState } from 'react';
import { TrashIcon, ArrowDownTrayIcon, FolderPlusIcon } from '@heroicons/react/24/outline';

import Header from './components/Header';
import Breadcrumb from './components/Breadcrumb';
import FileTable from './components/FileTable';
import AddItem from './AddItem';
// import ProgressBar from './components/ProgressBar';
import Spinner from './components/Icons';

import { toBase64, sortEntries } from './utils';
import { deleteFiles, downloadZip, getListDir } from './services/files';


export default function App() {
  const [path, setPath] = useState(toBase64('/'));
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  const [entries, _setEntries] = useState([]);

  const setEntries = (dataOrUpdater) => {
    if (typeof dataOrUpdater === 'function') {
      _setEntries(prev => sortEntries(dataOrUpdater(prev)));
    } else {
      _setEntries(sortEntries(dataOrUpdater));
    }
  };

  const fetchEntries = async (newPath, updateURL = true) => {
    getListDir(newPath, (data) => {
      setEntries(data);
      setPath(newPath);
      // update url without reload
      if (updateURL) {
        const query = new URLSearchParams({ path: newPath });
        window.history.pushState({ path: newPath }, '', `?${query.toString()}`);
      }
    });
  };

  const handleSelect = (path, checked) => {
    setSelected(prev => checked ? [...prev, path] : prev.filter(p => p !== path));
  };

  const handleFrontendDeletes = () => {
    setEntries(prev => prev.filter(e => !selected.includes(e.path)));
    setSelected([]);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} item?`)) {
      return;
    }
    deleteFiles(
      selected,
      handleFrontendDeletes,
      alert
    );
  };

  const handleFrontendAddItem = (data) => {
    setEntries(prev => {
      // reject duplicate name
      if (prev.some(e => e.name === data.name)) return prev;
      return [data, ...prev];
    });
  }

  useEffect(() => {
    const initialPath = new URLSearchParams(window.location.search).get('path') || toBase64('/');
    fetchEntries(initialPath, false); // don't update URL on initial load
  }, []);

  // Support back/forward browser navigation
  useEffect(() => {
    const onPopState = (event) => {
      const newPath = event.state?.path || toBase64('/');
      fetchEntries(newPath, false);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // 
  // const [zipProgress, setZipProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleZipDownload = async () => {
      setIsDownloading(true);
      // setZipProgress(0);

      downloadZip(selected, 
        () => {
          setTimeout(() => {
            // setZipProgress(0);
            setIsDownloading(false);
            setSelected([]);
          }, 1000);
        },
        (err) => {
          setIsDownloading(false);
          alert(err);
        }, 
        // (progress) => {
        //   setZipProgress(progress);
        // }
      );
  };


  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans min-h-[100vh]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Header search={search} setSearch={setSearch} path={path} fetchEntries={fetchEntries} />
        <div className="flex items-center justify-between mb-2">
          <Breadcrumb path={path} setPath={fetchEntries} />
          <div className="flex items-center space-x-2">
            {isDownloading && (
              // <div className="w-30">
              //   <ProgressBar progress={zipProgress} />
              // </div>
              <div className="flex text-gray-700 dark:text-gray-300 px-3">
                  <Spinner className="w-6 h-6 mr-1" />
                  Downloading...
              </div>
            )}
            {selected.length ? (
              <>
                <button 
                  className="text-green-500 hover:text-green-700" 
                  title="Download selected"
                  onClick={handleZipDownload}
                  disabled={isDownloading}
                >
                  <ArrowDownTrayIcon className="w-6 h-6 inline" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={handleDelete}
                  title="Delete Selected"
                >
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </>
            ) : (
              <>
                <AddItem 
                  path={path}
                  onSuccess={() => fetchEntries(path, false)}
                />
              </>
            )}
          </div>
        </div>
        <FileTable
          entries={entries}
          setPath={fetchEntries}
          selected={selected}
          onSelect={handleSelect}
          search={search}
          path={path}
        />
      </div>
    </div>
  );
}
