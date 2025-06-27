package file

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"
)

func AddFileOrDirToZip(zipWriter *zip.Writer, path string, baseInZip string) error {
	info, err := os.Stat(path)
	if err != nil {
		return err
	}
	if info.IsDir() {
		files, err := os.ReadDir(path)
		if err != nil {
			return err
		}
		for _, f := range files {
			subPath := filepath.Join(path, f.Name())
			subBase := filepath.Join(baseInZip, f.Name())
			AddFileOrDirToZip(zipWriter, subPath, subBase)
		}
	} else {
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		w, err := zipWriter.Create(baseInZip)
		if err != nil {
			return err
		}
		_, err = io.Copy(w, file)
		if err != nil {
			return err
		}
	}
	return nil
}
