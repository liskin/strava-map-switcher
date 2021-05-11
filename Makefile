.PHONY: zip
zip:
	git archive -o $(notdir $(CURDIR))-$(shell git describe).zip @

.PHONY: release
release:
	git tag -s v$(shell jq -r .version manifest.json)
	$(MAKE) zip
