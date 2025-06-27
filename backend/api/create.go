package api

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"

	"fileweb/config"
	"fileweb/file"
	"fileweb/utils"
)

type CreateRequest struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

func HandleCreateFolder(w http.ResponseWriter, r *http.Request) {
	handleCreate(w, r, true)
}

func HandleCreateFile(w http.ResponseWriter, r *http.Request) {
	handleCreate(w, r, false)
}

func handleCreate(w http.ResponseWriter, r *http.Request, isDir bool) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Path == "" || req.Name == "" {
		http.Error(w, `{"error":"Invalid JSON or missing path/name"}`, http.StatusBadRequest)
		return
	}

	decodedPath, err := utils.DecodePath(req.Path)
	if err != nil {
		http.Error(w, `{"error":"Invalid path"}`, http.StatusBadRequest)
		return
	}

	targetDir := filepath.Join(config.BasePath, filepath.Clean(decodedPath))
	if !strings.HasPrefix(targetDir, config.BasePath) {
		http.Error(w, `{"error":"Path not allowed"}`, http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(targetDir, req.Name)

	if isDir {
		err = file.CreateFolder(fullPath)
	} else {
		err = file.CreateFile(fullPath)
	}

	if err != nil {
		http.Error(w, `{"error":"Failed to create"}`, http.StatusInternalServerError)
		return
	}

	resp := map[string]string{
		"status": "ok",
		"path":   filepath.Join(decodedPath, req.Name),
		"name":   req.Name,
		"type":   utils.IfThenElse(isDir, "dir", "file"),
	}
	json.NewEncoder(w).Encode(resp)
}
