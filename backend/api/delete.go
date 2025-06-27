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

type DeleteRequest struct {
	Paths []string `json:"paths"`
}

func HandleFileDeletes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req DeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON body"}`, http.StatusBadRequest)
		return
	}

	if len(req.Paths) == 0 {
		http.Error(w, `{"error":"No paths provided"}`, http.StatusBadRequest)
		return
	}

	var deleted []string
	var skipped []string

	for _, raw := range req.Paths {
		decoded, err := utils.DecodePath(raw)
		if err != nil {
			skipped = append(skipped, raw)
			continue
		}

		fullPath := filepath.Join(config.BasePath, filepath.Clean(decoded))
		if !strings.HasPrefix(fullPath, config.BasePath) {
			skipped = append(skipped, raw)
			continue
		}

		if err := file.DeletePath(fullPath); err != nil {
			skipped = append(skipped, raw)
			continue
		}

		deleted = append(deleted, decoded)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"deleted": deleted,
		"skipped": skipped,
	})
}
