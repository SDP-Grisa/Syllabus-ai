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

export async function askQuestion(question, imageFile = null) {
    const formData = new FormData();
    formData.append("question", question);

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const res = await fetch(`${BASE_URL}/ask`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error("Ask failed");
    }

    return res.json();
}


