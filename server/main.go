package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
)

type Manga struct {
	Manga       string   `json:"manga"`    // Name
	Chapters    []string `json:"chapters"` // chapters read
	Date        int      `json:"date"`     // Date last read (unix timestamp)
	Url         string   `json:"url"`
	Author      string   `json:"author"`
	Status      string   `json:"status"`
	Genres      []string `json:"genres"`
	LastDate    string   `json:"lastDate"` // Last updated date from the website
	Description string   `json:"description"`
}

type Response struct {
	Status  string  `json:"status"`
	Message string  `json:"message"`
	Data    []Manga `json:"data"`
}

var mangaHistory []Manga

func main() {
	fmt.Println("Server started")
	readSavedData()
	http.HandleFunc("/test", testHandler)
	http.HandleFunc("/manga", mangaHandler)

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}
	addrs, _ := net.LookupIP(hostname)
	fmt.Println("\nLocal IPs:")
	for _, addr := range addrs {
		fmt.Println(">", addr)
	}
	fmt.Println("\nListening on port 7777\n")

	err = http.ListenAndServe(":7777", nil)
	if err != nil {
		panic(err)
	}
}

func readSavedData() {
	fmt.Println("\nReading saved data:")
	file, err := os.ReadFile("data.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("> Data found, parsing...")
	err = json.Unmarshal(file, &mangaHistory)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("> Data parsed successfully")
	fmt.Println("> Found:", len(mangaHistory), "manga")
}

func saveData() {
	data, err := json.Marshal(mangaHistory)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = os.WriteFile("data.json", data, 0644)
	if err != nil {
		fmt.Println(err)
	}
}

func testHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("GET /test")
	response := Response{
		Status:  "success",
		Message: "Connection successful",
		Data:    []Manga{},
	}
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func mangaHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
        fmt.Println("GET /manga")
		response := Response{
			Status:  "success",
			Message: "Data fetched successfully",
			Data:    mangaHistory,
		}
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	case "POST":
        fmt.Println("POST /manga")
		var newMangaHistory []Manga
		err := json.NewDecoder(r.Body).Decode(&newMangaHistory)
		if err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}
		mangaHistory = newMangaHistory
		saveData()
		response := Response{
			Status:  "success",
			Message: "Data saved successfully",
			Data:    []Manga{},
		}
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}
