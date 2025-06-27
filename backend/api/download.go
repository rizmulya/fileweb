package api

import (
	"archive/zip"
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"

	"fileweb/config"
	"fileweb/file"
	"fileweb/utils"
)

func HandleZipDownload(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Paths []string `json:"paths"` // encoded paths
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || len(req.Paths) == 0 {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="download.zip"`)

	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()

	for _, encoded := range req.Paths {
		decoded, err := utils.DecodePath(encoded)
		if err != nil {
			continue
		}
		fullPath := filepath.Join(config.BasePath, filepath.Clean(decoded))
		if !strings.HasPrefix(fullPath, config.BasePath) {
			continue
		}

		err = file.AddFileOrDirToZip(zipWriter, fullPath, filepath.Join("download", filepath.Base(decoded)))
		if err != nil {
			continue
		}
	}
}

// version 2: support frontend progress bar

// func HandleZipDownload(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Access-Control-Allow-Origin", "*")

// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var req struct {
// 		Paths []string `json:"paths"`
// 	}
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.Paths) == 0 {
// 		http.Error(w, "Invalid request", http.StatusBadRequest)
// 		return
// 	}

// 	var buf bytes.Buffer
// 	zipWriter := zip.NewWriter(&buf)

// 	for _, encoded := range req.Paths {
// 		decoded, err := utils.DecodePath(encoded)
// 		if err != nil {
// 			continue
// 		}
// 		fullPath := filepath.Join(config.BasePath, filepath.Clean(decoded))
// 		if !strings.HasPrefix(fullPath, config.BasePath) {
// 			continue
// 		}
// 		err = file.AddFileOrDirToZip(zipWriter, fullPath, filepath.Join("download", filepath.Base(decoded)))
// 		if err != nil {
// 			continue
// 		}
// 	}

// 	if err := zipWriter.Close(); err != nil {
// 		http.Error(w, "Failed to finalize ZIP", http.StatusInternalServerError)
// 		return
// 	}

// 	zipBytes := buf.Bytes()
// 	w.Header().Set("Content-Type", "application/zip")
// 	w.Header().Set("Content-Disposition", `attachment; filename="download.zip"`)
// 	w.Header().Set("Content-Length", strconv.Itoa(len(zipBytes)))
// 	w.Write(zipBytes)
// }
