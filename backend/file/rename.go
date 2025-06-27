package file

import (
	"fmt"
	"log"
	"os"
)

func RenamePath(oldPath, newPath string) error {
	log.Println("oldPath =", oldPath)

	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		return fmt.Errorf("source does not exist")
	}

	if _, err := os.Stat(newPath); err == nil {
		return fmt.Errorf("target already exists")
	}

	return os.Rename(oldPath, newPath)
}
