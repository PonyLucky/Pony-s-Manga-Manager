FROM golang:alpine

WORKDIR /app

# Create directory for the app
RUN mkdir -p /app
RUN mkdir -p /app/data

COPY server/main.go /app/main.go

RUN go mod init main
RUN go mod tidy
RUN go build -o main main.go

EXPOSE 7777

VOLUME /app/

CMD ["/app/main"]