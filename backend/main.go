package main

import (
	"log"
	"net/http"

	"fileweb/api"
)

func main() {
	http.HandleFunc("/api/ls", api.HandleDirList)
	http.HandleFunc("/api/raw", api.HandleRawFile)

	http.HandleFunc("/api/upload", api.HandleFileUpload)
	http.HandleFunc("/api/deletes", api.HandleFileDeletes)

	http.HandleFunc("/api/new-folder", api.HandleCreateFolder)
	http.HandleFunc("/api/new-file", api.HandleCreateFile)
	http.HandleFunc("/api/write-file", api.HandleWriteFile)
	http.HandleFunc("/api/rename-dir", api.HandleRenameDir)

	http.HandleFunc("/api/zip-download", api.HandleZipDownload)

	log.Println("Serving on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// func handleDirList(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Access-Control-Allow-Origin", "*")
// 	reqPath, err := decodePath(r.URL.Query().Get("path"))
// 	if err != nil {
// 		http.Error(w, "Invalid path", http.StatusBadRequest)
// 		return
// 	}
// 	absPath := filepath.Join(basePath, filepath.Clean(reqPath))

// 	info, err := os.Stat(absPath)
// 	if err != nil || !info.IsDir() {
// 		http.Error(w, `{"error":"Not a valid directory"}`, http.StatusBadRequest)
// 		return
// 	}

// 	files, err := os.ReadDir(absPath)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	var entries []DirEntry
// 	for _, file := range files {
// 		fullPath := filepath.Join(absPath, file.Name())
// 		fi, err := os.Stat(fullPath)
// 		if err != nil {
// 			continue
// 		}

// 		entry := DirEntry{
// 			Name:  file.Name(),
// 			IsDir: file.IsDir(),
// 			Type:  ifThenElse(file.IsDir(), "dir", "file"),
// 			Path:  encodePath(filepath.Join(reqPath, file.Name())),
// 		}

// 		if !file.IsDir() {
// 			entry.Size = formatFileSize(fi.Size())
// 			entry.Ext = strings.ToLower(filepath.Ext(file.Name()))
// 		}

// 		entries = append(entries, entry)
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(entries)
// }

// func handleRawFile(w http.ResponseWriter, r *http.Request) {
// 	reqPath, err := decodePath(r.URL.Query().Get("path"))
// 	if err != nil {
// 		http.Error(w, "Invalid path", http.StatusBadRequest)
// 		return
// 	}
// 	absPath := filepath.Join(basePath, filepath.Clean(reqPath))

// 	info, err := os.Stat(absPath)
// 	if err != nil || info.IsDir() {
// 		http.Error(w, "File not found or is a directory", http.StatusNotFound)
// 		return
// 	}

// 	f, err := os.Open(absPath)
// 	if err != nil {
// 		http.Error(w, "Failed to open file", http.StatusInternalServerError)
// 		return
// 	}
// 	defer f.Close()

// 	filename := info.Name()
// 	ext := strings.ToLower(filepath.Ext(filename))

// 	// Prevent dangerous
// 	//
// 	// Deteksi MIME
// 	head := make([]byte, 512)
// 	f.Read(head)
// 	f.Seek(0, io.SeekStart)
// 	detectedMime := http.DetectContentType(head)

// 	// Ambil mime utama tanpa charset
// 	mimeMain, _, err := mime.ParseMediaType(detectedMime)
// 	if err != nil {
// 		mimeMain = detectedMime // fallback
// 	}

// 	dangerousExts := map[string]bool{
// 		".html": true, ".htm": true, ".svg": true, ".xml": true, ".js": true, ".mjs": true,
// 		".md": true, ".json": true, ".jsx": true, ".ts": true, ".tsx": true,
// 		".php": true, ".asp": true, ".aspx": true, ".jsp": true,
// 		".py": true, ".rb": true, ".sh": true, ".bat": true, ".pl": true, ".cgi": true,
// 	}

// 	dangerousMimes := map[string]bool{
// 		"text/html":               true,
// 		"application/xhtml+xml":   true,
// 		"application/xml":         true,
// 		"image/svg+xml":           true,
// 		"application/javascript":  true,
// 		"text/javascript":         true,
// 		"text/jsx":                true,
// 		"application/json":        true,
// 		"text/markdown":           true,
// 		"application/x-httpd-php": true,
// 	}

// 	if dangerousMimes[mimeMain] || dangerousExts[ext] {
// 		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
// 	}

// 	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, filename))

// 	http.ServeContent(w, r, filename, info.ModTime(), f)
// }
