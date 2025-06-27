package file

import (
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
)

// SaveUploadedFile saves a multipart.FileHeader to the given destination directory.
func SaveUploadedFile(fileHeader *multipart.FileHeader, destDir string) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	filename := filepath.Base(fileHeader.Filename)
	outPath := filepath.Join(destDir, filename)

	out, err := os.Create(outPath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	if _, err := io.Copy(out, src); err != nil {
		return "", err
	}

	return filename, nil
}
