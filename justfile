dev_front:
    npm --C frontend run dev

dev_back:
    RUST_LOG=DEBUG cargo run
# build:
#     rm -rf frontend/dist
#     mkdir -p frontend/dist/assets
#     cd frontend && npm run build
#     # cp frontend/dist/index.html frontend/dist/assets/index.html
#     RUST_LOG=DEBUG cargo build

# run:
#     rm -rf frontend/dist
#     mkdir -p frontend/dist/assets
#     cd frontend && npm run build
#     # cp frontend/dist/index.html frontend/dist/assets/index.html
#     RUST_LOG=DEBUG cargo run -r 


