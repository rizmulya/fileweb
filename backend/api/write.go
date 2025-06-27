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

type WriteRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

func HandleWriteFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req WriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Path == "" {
		http.Error(w, `{"error":"Invalid JSON or missing path"}`, http.StatusBadRequest)
		return
	}

	decodedPath, err := utils.DecodePath(req.Path)
	if err != nil {
		http.Error(w, `{"error":"Invalid path"}`, http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(config.BasePath, filepath.Clean(decodedPath))
	if !strings.HasPrefix(fullPath, config.BasePath) {
		http.Error(w, `{"error":"Path not allowed"}`, http.StatusBadRequest)
		return
	}

	if err := file.WriteFile(fullPath, []byte(req.Content)); err != nil {
		http.Error(w, `{"error":"Failed to write file"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"path":   decodedPath,
	})
}
