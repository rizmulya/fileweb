package utils

import (
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"
)

func IfThenElse(cond bool, a, b string) string {
	if cond {
		return a
	}
	return b
}

func FormatFileSize(size int64) string {
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

func EncodePath(path string) string {
	escaped := url.PathEscape(path)
	return base64.StdEncoding.EncodeToString([]byte(escaped))
}

func DecodePath(encoded string) (string, error) {
	decodedBytes, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}
	unescaped, err := url.PathUnescape(string(decodedBytes))
	if err != nil {
		return "", fmt.Errorf("failed to unescape path: %w", err)
	}
	return unescaped, nil
}

var DangerousExts = map[string]bool{
	".html": true, ".htm": true, ".svg": true, ".xml": true, ".js": true, ".mjs": true,
	".md": true, ".json": true, ".jsx": true, ".ts": true, ".tsx": true,
	".php": true, ".asp": true, ".aspx": true, ".jsp": true,
	".py": true, ".rb": true, ".sh": true, ".bat": true, ".pl": true, ".cgi": true,
}

var DangerousMimes = map[string]bool{
	"text/html": true, "application/xhtml+xml": true, "application/xml": true,
	"image/svg+xml": true, "application/javascript": true, "text/javascript": true,
	"text/jsx": true, "application/json": true, "text/markdown": true,
	"application/x-httpd-php": true,
}

func IsDangerousMime(mimeType, ext string) bool {
	return DangerousMimes[mimeType] || DangerousExts[strings.ToLower(ext)]
}
