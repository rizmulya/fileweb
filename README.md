# File Web

a lightweight and fast `web-based file sharing` built with `React` and `Golang`. 

- List files and folders
- View raw files 
- Upload files 
- Delete multiple files
- Create new folders 
- Create/write files 
- Rename folders
- Download selected files as ZIP
- Pdf preview support on mobile device
- Basic Auth with Nginx
- Multiple Auth and Sharing (soon)

setup :
- set base url at `frontend/src/const.jsx`
- create password with `htpasswd -c .htpasswd yourusername`
- set sharing/accessable directory at `docker-compose.yml`
- build react `npm run build`
- run docker `docker-compose up --build -d`

default auth: admin/admin