REPO_PATH = /Users/ciju/repos/go/ideas/asideas/src/github.com/ciju/devmirror-server
EXTENSION_PATH = $(REPO_PATH)/extension
KEY=$(REPO_PATH)/key.pem

extension: extension/*
	cd $(REPO_PATH)
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --pack-extension=$(EXTENSION_PATH) --pack-extension-key=$(KEY)
	mv ./extension.crx packed-extension/devmirror.crx
