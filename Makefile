.PHONY: zip
zip:
	.scripts/zip.sh

.PHONY: release
release:
	git tag -s v$(shell jq -r .version manifest.json)
	$(MAKE) zip
