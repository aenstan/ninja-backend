#!/usr/bin/env bash

get_push_tokens() {
    local currentTimeStamp=$(date +%s)
    local api=$(
        curl -s --noproxy "*" "http://localhost:5600/api/envs?searchValue=JD_COOKIE&t=$currentTimeStamp" \
            -H "Accept: application/json" \
            -H "Authorization: Bearer $token" \
            --compressed
    )
    local code=$(echo $api | jq -r .code)
    local message=$(echo $api | jq -r .message)
    if [[ $code == 200 ]]; then
        echo -e "获取 token 成功"
        local data=$(echo $api | jq '[ .data | .[] | {cookie: .value, token: .remarks} ]')
        local data_count=$(echo $data | jq '. | length')
        if [[ $data ]]; then
            local envs=$(eval echo "\$JD_COOKIE")
            local array=($(echo $envs | sed 's/&/ /g'))
            local user_sum=${#array[*]}
            for ((i = 1; i <= $user_sum; i++)); do
                for ((j = i; j <= $data_count; j++)); do
                    local cookie=$(echo $data | jq .[$j-1].cookie | sed 's/\"//g')
                    local token=$(echo $data | jq .[$j-1].token | sed 's/\"//g')
                    if [[ ${array[i - 1]} == $cookie && $token != null ]]; then
                        export PUSH_PLUS_TOKEN$i=$token
                        continue
                    fi
                done
            done
        fi
    else
        echo -e "获取 push token 失败(${message})"
    fi
}

get_push_tokens
