package main

import (
	"encoding/base64"
	"fmt"
	"net/url"
)

func ifThenElse(cond bool, a, b string) string {
	if cond {
		return a
	}
	return b
}

func formatFileSize(size int64) string {
	const (
		KB = 1024
		MB = KB * 1024
		GB = MB * 1024
	)

	switch {
	case size >= GB:
		return fmt.Sprintf("%.2f GB", float64(size)/float64(GB))
	case size >= MB:
		return fmt.Sprintf("%.2f MB", float64(size)/float64(MB))
	case size >= KB:
		return fmt.Sprintf("%.2f KB",
			float64(size)/float64(KB))
	default:
		return fmt.Sprintf("%d B", size)
	}
}

func encodePath(path string) string {
	escaped := url.QueryEscape(path)
	return base64.StdEncoding.EncodeToString([]byte(escaped))
}

func decodePath(base64Path string) (string, error) {
	decodedBytes, err := base64.StdEncoding.DecodeString(base64Path)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}
	unescaped, err := url.QueryUnescape(string(decodedBytes))
	if err != nil {
		return "", fmt.Errorf("failed to unescape path: %w", err)
	}
	return unescaped, nil
}
