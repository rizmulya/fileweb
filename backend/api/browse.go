package api

import (
	"encoding/json"
	"net/http"
	"path/filepath"

	"fileweb/config"
	"fileweb/file"
	"fileweb/utils"
)

func HandleDirList(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	reqPath, err := utils.DecodePath(r.URL.Query().Get("path"))
	if err != nil {
		http.Error(w, `{"error":"Invalid path"}`, http.StatusBadRequest)
		return
	}
	absPath := filepath.Join(config.BasePath, filepath.Clean(reqPath))

	entries, err := file.ListDirectory(absPath, reqPath)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(entries)
}
