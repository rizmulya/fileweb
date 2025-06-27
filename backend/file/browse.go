package file

import (
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"fileweb/utils"
)

type DirEntry struct {
	Name  string `json:"name"`
	IsDir bool   `json:"is_dir"`
	Type  string `json:"type"`
	Path  string `json:"path"`
	Size  string `json:"size,omitempty"`
	Ext   string `json:"ext,omitempty"`
}

func ListDirectory(absPath string, reqPath string) ([]DirEntry, error) {
	info, err := os.Stat(absPath)
	if err != nil || !info.IsDir() {
		return nil, fmt.Errorf("not a valid directory")
	}

	files, err := os.ReadDir(absPath)
	if err != nil {
		return nil, err
	}

	var entries []DirEntry
	for _, file := range files {
		fullPath := filepath.Join(absPath, file.Name())
		fi, err := os.Stat(fullPath)
		if err != nil {
			continue
		}

		entry := DirEntry{
			Name:  file.Name(),
			IsDir: file.IsDir(),
			Type:  utils.IfThenElse(file.IsDir(), "dir", "file"),
			Path:  utils.EncodePath(filepath.Join(reqPath, file.Name())),
		}

		if !file.IsDir() {
			entry.Size = utils.FormatFileSize(fi.Size())
			entry.Ext = strings.ToLower(filepath.Ext(file.Name()))
		}

		entries = append(entries, entry)
	}
	return entries, nil
}

func IsDangerousFile(f *os.File, ext string) bool {
	head := make([]byte, 512)
	f.Read(head)
	f.Seek(0, 0)
	detectedMime := http.DetectContentType(head)
	mimeMain, _, err := mime.ParseMediaType(detectedMime)
	if err != nil {
		mimeMain = detectedMime
	}
	return utils.IsDangerousMime(mimeMain, ext)
}
