REPO_PATH = $(shell pwd)
EXTENSION_PATH = $(REPO_PATH)/extension
KEY=$(REPO_PATH)/key.pem

extension: extension/*
	cd $(REPO_PATH)
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --pack-extension=$(EXTENSION_PATH) --pack-extension-key=$(KEY)
	mv ./extension.crx packed-extension/devmirror.crx

binaries: devmirror.go
	go get
	go build -o bin/devmirror -ldflags "-X main.version `cat VERSION`" devmirror.go

