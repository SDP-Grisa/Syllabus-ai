const BASE_URL = "http://localhost:8000";

export async function uploadPDF(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/upload-pdf`, {
        method: "POST",
        body: formData
    });

    return res.json();
}

export async function askQuestion(question) {
    const params = new URLSearchParams({ question });

    const res = await fetch(`${BASE_URL}/ask?${params}`, {
        method: "POST"
    });

    return res.json();
}
