package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"fileweb/config"
	"fileweb/file"
)

type RenameRequest struct {
	OldPath string `json:"oldPath"`
	NewPath string `json:"newPath"`
}

func HandleRenameDir(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req RenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OldPath == "" || req.NewPath == "" {
		http.Error(w, `{"error":"Invalid JSON or missing oldPath/newPath"}`, http.StatusBadRequest)
		return
	}

	oldAbs := filepath.Join(config.BasePath, filepath.Clean(req.OldPath))
	newAbs := filepath.Join(config.BasePath, filepath.Clean(req.NewPath))

	if !strings.HasPrefix(oldAbs, config.BasePath) || !strings.HasPrefix(newAbs, config.BasePath) {
		http.Error(w, `{"error":"Path not allowed"}`, http.StatusBadRequest)
		return
	}

	err := file.RenamePath(oldAbs, newAbs)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"oldPath": req.OldPath,
		"newPath": req.NewPath,
	})
}
