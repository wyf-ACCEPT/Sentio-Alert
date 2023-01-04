npx -p @sentio/sdk sentio login                     # Login via explorer
npx -p @sentio/sdk sentio create -n <project_name>
cd <project_name>
# Paste the ABI json file to ./abis/
yarn install
yarn upload     # yarn sentio upload

for dir in ./*
do
    echo "$dir"
    cd "$dir"
    # npx -y -p @sentio/sdk sentio gen
    npx -y -p @sentio/sdk sentio build
    cd ..
done

- ReExp: ,\n\s+"gas": \d+

# update package!
yarn upgrade @sentio/sdk@latest