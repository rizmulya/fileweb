FROM golang:1.22.5-alpine

# id -u 
ARG UID=1000
RUN adduser --disabled-password --uid $UID appuser

WORKDIR /app

COPY . .

RUN go build -o app .

USER appuser

EXPOSE 8080

CMD ["./app"]
