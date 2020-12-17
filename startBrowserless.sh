docker run \
    -p 3000:3000 \
    -e "MAX_CONCURRENT_SESSIONS=1" \
    -e "MAX_QUEUE_LENGTH=0" \
    -e "PREBOOT_CHROME=true" \
    -e "DEFAULT_BLOCK_ADS=true" \
    -e "ENABLE_DEBUGGER=false" \
    -e "CONNECTION_TIMEOUT=300000" \
    --restart always \
    browserless/chrome
