package file

import (
	"os"
	"path/filepath"
)

// WriteFile writes content to the given full path (absolute path assumed valid and safe).
func WriteFile(fullPath string, content []byte) error {
	// Make sure parent directory exists
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return err
	}

	// Write the file content
	return os.WriteFile(fullPath, content, 0644)
}
