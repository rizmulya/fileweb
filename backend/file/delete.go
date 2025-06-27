package file

import (
	"os"
)

func DeletePath(fullPath string) error {
	return os.RemoveAll(fullPath)
}
