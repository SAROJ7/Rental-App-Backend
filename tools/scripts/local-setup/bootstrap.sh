#! /bin/bash

pnpm i

source ./tools/scripts/local-setup/utils.sh

current_env

create_rental_app_volumes

start_dev_tools