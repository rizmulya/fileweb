package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"fileweb/config"
	"fileweb/file"
	"fileweb/utils"
)

func HandleFileUpload(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, `{"error":"Invalid multipart form"}`, http.StatusBadRequest)
		return
	}

	reqPath := r.FormValue("path")
	if reqPath == "" {
		http.Error(w, `{"error":"Path is required"}`, http.StatusBadRequest)
		return
	}

	decodedPath, err := utils.DecodePath(reqPath)
	if err != nil {
		http.Error(w, `{"error":"Invalid path"}`, http.StatusBadRequest)
		return
	}

	destDir := filepath.Join(config.BasePath, filepath.Clean(decodedPath))
	if !strings.HasPrefix(destDir, config.BasePath) {
		http.Error(w, `{"error":"Invalid path"}`, http.StatusBadRequest)
		return
	}

	if err := os.MkdirAll(destDir, 0755); err != nil {
		http.Error(w, `{"error":"Cannot create directory"}`, http.StatusInternalServerError)
		return
	}

	files := r.MultipartForm.File["files"]
	if files == nil {
		files = r.MultipartForm.File["files[]"]
	}

	if len(files) == 0 {
		http.Error(w, `{"error":"No file uploaded"}`, http.StatusBadRequest)
		return
	}

	savedFiles := []string{}
	for _, fh := range files {
		name, err := file.SaveUploadedFile(fh, destDir)
		if err == nil {
			savedFiles = append(savedFiles, name)
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"uploaded": len(savedFiles),
		"files":    savedFiles,
	})
}
