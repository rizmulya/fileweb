import { API_RAW } from "./const";

export const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

export const fromBase64 = (str) => decodeURIComponent(unescape(atob(str)));

export function sortEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return [...entries].sort((a, b) => {
    if (a.is_dir && !b.is_dir) return -1;
    if (!a.is_dir && b.is_dir) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function limitStr(str, max = 60) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

export function getFileType(name) {
  const ext = name.toLowerCase().split('.').pop();
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "img";
  if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["txt", "md", "log"].includes(ext)) return "text";
  if (["html", "htm"].includes(ext)) return "code";
  if (["exe", "msi", "sh", "bat"].includes(ext)) return "bin";
  return "other";
}

export function isEditableFile(ext) {
  if([
    ".txt", ".md", ".log", ".html", ".htm", ".sh", ".bat",
    ".svg", ".xml", ".js", ".mjs", ".json", ".jsx", ".ts", ".tsx", 
    ".php", ".asp", ".aspx", ".jsp", ".py", ""
  ].includes(ext)) return true;
  return false;
}



export function getFileHref(entry) {
  const isMobileOrTablet = window.innerWidth < 768;
  const fileType = getFileType(entry.name);

  if (fileType === 'pdf' && !entry.is_dir && isMobileOrTablet) {
    const encoded = encodeURIComponent(`${API_RAW}?path=${entry.path}`);
    return `/pdfjs/web/viewer.html?file=${encoded}`;
  }

  return `${API_RAW}?path=${encodeURIComponent(entry.path)}`;
}


export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
