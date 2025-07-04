
const DEFAULT_BASE_URL = 'http://localhost';

const BASE_URL = (() => {
  let url = localStorage.getItem('BASE_URL');
  if (!url) {
    url = DEFAULT_BASE_URL;
    localStorage.setItem('BASE_URL', url);
  }
  return url;
})();

export const API_DELETE = BASE_URL + "/api/deletes";
export const API_LS = BASE_URL + "/api/ls";
export const API_NEW_FILE = BASE_URL + "/api/new-file";
export const API_NEW_FOLDER = BASE_URL + "/api/new-folder";
export const API_UPLOAD = BASE_URL + "/api/upload";
export const API_RAW = BASE_URL + "/api/raw";
export const API_WRITE_FILE = BASE_URL + "/api/write-file";
export const API_RENAME_DIR = BASE_URL + "/api/rename-dir";
export const API_ZIP_DOWNLOAD = BASE_URL + "/api/zip-download";