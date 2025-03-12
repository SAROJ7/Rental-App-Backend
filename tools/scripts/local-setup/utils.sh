current_dir="$PWD"

current_env() {
    declare -a projectDirs=(
        "$current_dir"
        "$current_dir/tools/dev-tools"
    )

    for project in "${projectDirs[@]}"; do
        env_file="$project/.env"
        if [ -f "$project/.env.example" ]; then
            example_content=$(<"$project/.env.example")
            echo "$example_content" > "$env_file"
        else
            echo "Warning: .env.example not found in $project"
        fi
    done
}

create_rental_app_volumes() {
    docker volume create rental_app_pg_data &&
    docker volume create rental_app_pg_admin_data
}

start_dev_tools() {
    if ! docker network inspect rental_app_platform >/dev/null 2>&1; then
        docker network create rental_app_platform
    fi

    declare -a composeDirs=(
        "$current_dir/tools/dev-tools"
    )

    for project in "${composeDirs[@]}"; do
        compose_file="$project/docker-compose.yml"
        if [ -f "$compose_file" ]; then
            docker compose -f "$compose_file" up -d
        else
            echo "Error: docker-compose.yml not found in $project"
        fi
    done

    echo "Waiting for the dev tools to start..."
    sleep 10
}

stop_dev_tools() {
    declare -a composeDirs=(
        "$current_dir/tools/dev-tools"
    )

    for project in "${composeDirs[@]}"; do
        compose_file="$project/docker-compose.yml"
        docker compose -f $compose_file down
    done
}

remove_rental_app_volumes() {
    docker volume rm rental_app_pg_data &&
    docker volume rm rental_app_pg_admin_data
}

rm_modules() {
    rm -rf dist node_modules tmp
}

reset() {
    stop_dev_tools
    remove_rental_app_volumes
    rm_modules
}