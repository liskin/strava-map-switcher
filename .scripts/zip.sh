#!/usr/bin/env bash

set -eu -o pipefail
shopt -s lastpipe

function o { printf -->&2 "%s:%s\\n" "${0##*/}" "$(printf " %q" "$@")"; "$@"; }

version=$(git describe)
zip="strava-map-switcher-${version}.zip"
jq -r 'input_filename, .content_scripts[].js[], .web_accessible_resources[], (.icons | to_entries | .[].value)' manifest.json \
| readarray -t files

o git archive -o "$zip" @ "${files[@]}"
