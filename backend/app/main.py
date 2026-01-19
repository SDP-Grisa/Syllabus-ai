from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="Multi-Modal Syllabus AI")


# Enable CORS
origins = [
    "http://localhost:5173",  # your frontend origin
    "http://localhost:5174",
    # "http://localhost:3000",  # add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # or ["*"] for any origin (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static/images",
    StaticFiles(directory="data/images"),
    name="images",
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
