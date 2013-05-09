package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

import (
	"github.com/ciju/gotunnel/gtclient"
	l "github.com/ciju/gotunnel/log"
	"github.com/ciju/vercheck"
)

var version string

// -- a small server to serve the allocated subdomain.
type ServerInfo string

func (s ServerInfo) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprint(w, s)
}

func startServerInfo(s string) {
	err := http.ListenAndServe("localhost:17171", ServerInfo(s+":8080"))

	if err != nil {
		l.Fatal("Couldn't start server to serve subdomain info")
	}
	l.Log("Subdomain info server started")
}

// -- end: a small server to serve the allocated subdomain.

var (
	subdomain    = flag.String("sub", "", "request subdomain to serve on")
	skipVerCheck = flag.Bool("sc", false, "Skip new update check")
	chrome_path  = flag.String("c", "", "Chrome application path")
)

func Usage() {
	fmt.Fprintf(os.Stderr, "Usage: %s [OPTIONS]\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "\nOptions:\n")
	flag.PrintDefaults()
}

// option to set chrome binary path
// different for each OS.
var (
	chrome_darwin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
)

func chromePath() string {
	if runtime.GOOS == "darwin" {
		return chrome_darwin
	}

	if *chrome_path != "" {
		l.Log("chrome path %v %v", *chrome_path, runtime.GOOS)
		return *chrome_path
	}

	fmt.Fprintf(os.Stderr, "Please provide chrome installation path. Use option -c ")
	Usage()
	os.Exit(1)
	return ""
}

func dwndext(url, path string) bool {
	resp, err := http.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	out, err := os.Create(path)
	if err != nil {
		return false
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		l.Log("%s", err)
		return false
	}

	return true
}

const (
	extensionJSON = `{
  "external_crx": "{{extensiondir}}/devmirror.crx",
  "external_version": "2"
}`
	extensionId = "bgpenplcdojibkncmhmjcobgclchgimd"
)

// chrome_path as option.
// cross-compile
func main() {
	flag.Usage = Usage
	flag.Parse()

	if vercheck.HasMinorUpdate(
		"https://raw.github.com/ciju/devmirror/master/VERSION",
		version,
	) {
		l.Info(`
New version of Devmirror is available. 
Please update the binary, or start with 
option -sc to continue with this version.
`)
		os.Exit(1)
	}

	// TODO: do a version check
	servInfo, start := make(chan string), make(chan bool)

	go func() {
		if !gtclient.SetupClient("9222", "localtunnel.net:34000", *subdomain, servInfo) {
			flag.Usage()
			os.Exit(1)
		}
	}()

	cpath := os.TempDir() + "chrome"
	lpath := cpath + "/External Extensions"
	os.MkdirAll(lpath, 0755)

	// l.Log("the temp path", lpath)

	go func() {
		// download the extension from github.
		giturl := "https://github.com/ciju/devmirror-server/raw/master/packed-extension"

		dwndext(giturl+"/devmirror.crx", lpath+"/devmirror.crx")

		config := strings.Replace(extensionJSON, "{{extensiondir}}", lpath, -1)
		conffile := lpath + "/" + extensionId + ".json"
		err := ioutil.WriteFile(conffile, []byte(config), 0755)
		if err != nil {
			fmt.Println("something went wrong while creating extension config %v", err)
			os.Exit(1)
		}

		start <- true
	}()

	info := <-servInfo

	go startServerInfo(info)

	<-start

	// open the browser
	cmd := exec.Command(chromePath(),
		"--user-data-dir="+cpath,
		"--no-first-run",
		"--remote-debugging-port=9222",
	)

	fmt.Printf("Your session is being devmirrored at: \033[1;34m%s\033[0m\n", info)
	// l.Info("Starting Chrome browser : %+v", strings.Join(cmd.Args, " "))

	_, err := cmd.CombinedOutput()
	if err != nil {
		l.Log("error %v", err)
	}

	err = cmd.Run()
	if err != nil {
		l.Log("Something went wrong", err)
	}

}
