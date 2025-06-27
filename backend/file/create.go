package file

import (
	"os"
	"path/filepath"
)

// CreateFolder creates a new directory.
func CreateFolder(path string) error {
	return os.MkdirAll(path, 0755)
}

// CreateFile creates an empty file, ensuring its directory exists.
func CreateFile(path string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	return f.Close()
}
