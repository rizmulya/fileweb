package api

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"fileweb/config"
	"fileweb/file"
	"fileweb/utils"
)

func HandleRawFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	reqPath, err := utils.DecodePath(r.URL.Query().Get("path"))
	if err != nil {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	absPath := filepath.Join(config.BasePath, filepath.Clean(reqPath))

	info, err := os.Stat(absPath)
	if err != nil || info.IsDir() {
		http.Error(w, "File not found or is a directory", http.StatusNotFound)
		return
	}

	f, err := os.Open(absPath)
	if err != nil {
		http.Error(w, "Failed to open file", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	ext := strings.ToLower(filepath.Ext(info.Name()))
	if file.IsDangerousFile(f, ext) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, info.Name()))
	http.ServeContent(w, r, info.Name(), info.ModTime(), f)
}
