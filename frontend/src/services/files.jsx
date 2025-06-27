import { API_DELETE, API_LS, API_ZIP_DOWNLOAD, API_UPLOAD, API_RAW, API_WRITE_FILE } from "../const";

// Write File
export const writeFile =  async (
    path, 
    content, 
    onSuccess = () => {},
    onError = () => {},
) => {
  try {
    const res = await fetch(API_WRITE_FILE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Network Error');
    }

    onSuccess();
  } catch (error) {
    onError(error.message || 'Network Error');
  }
}


// Get file content (plain text)
export const getPlainTextFileContent = async (
    path,
    onSuccess = () => {},
    onError = () => {},
) => {
    try {
        const res = await fetch(`${API_RAW}?path=${encodeURIComponent(path)}`);
        const text = await res.text().catch(() => '');

        if (!res.ok) {
            throw new Error(text || 'Network Error');
        }

        onSuccess(text);
    } catch (err) {
        onError(err.message || 'Network Error');
    }
};


// Upload File
export function uploadFiles({
  files,
  path,
  onProgress = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  formData.append("path", path);
  files.forEach((file) => formData.append("files[]", file));

  const xhr = new XMLHttpRequest();
  xhr.open("POST", API_UPLOAD);

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      onProgress(percent);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      onSuccess();
    } else {
      onError("Upload failed with status: " + xhr.status);
    }
  };

  xhr.onerror = () => {
    onError("Terjadi kesalahan saat upload");
  };

  xhr.send(formData);
}


// Create File/Folder
export const createDir =  async (
    path,
    name,
    api, 
    onSuccess = () => {},
    onError = () => {},
) => {
  try {
    const res = await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, name }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Network Error');
    }

    onSuccess();
  } catch (error) {
    onError(error.message || 'Network Error');
  }
}


// Zip Download
export const downloadZip =  async ( 
    paths,
    onSuccess = () => {},
    onError = () => {},
    // setProgress = () => {},
) => {
  try {
    const res = await fetch(API_ZIP_DOWNLOAD, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paths })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Network Error');
    }

    // const contentLength = +res.headers.get('Content-Length') || 0;
    const reader = res.body.getReader();
    const chunks = [];
    // let received = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        // received += value.length;
        // if (contentLength) {
        //   const percent = Math.round((received / contentLength) * 100);
        //   setProgress(percent);
        // }
    }

    const blob = new Blob(chunks, { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "download-" + new Date().toISOString().slice(0,10) + ".zip"
    a.click();
    URL.revokeObjectURL(url);

    onSuccess();
  } catch (error) {
    onError(error.message || 'Network Error');
  }
}


// Get List Dir
export const getListDir =  async (
    newPath, 
    onSuccess = () => {},
    onError = () => {},
) => {
  try {
    const res = await fetch(`${API_LS}?path=${newPath}`);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Network Error');
    }

    onSuccess(data);
  } catch (error) {
    onError(error.message || 'Network Error');
  }
}


// Delete Files
export const deleteFiles =  async (
    paths, 
    onSuccess = () => {},
    onError = () => {},
) => {
  try {
    const res = await fetch(API_DELETE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Network Error');
    }

    onSuccess();
  } catch (error) {
    onError(error.message || 'Network Error');
  }
}
