import { ASK_ENDPOINT } from "./config";

type AskAnswerPayload = {
    answer?: string;
};

type AskResponseBody = {
    question?: string;
    file_id?: string;
    message?: string;
    answer?: AskAnswerPayload | string;
};

const TEMP_FILE_ID = "9dc50dff";

export async function askQuestion(question: string, fileId: string = TEMP_FILE_ID) {
    const trimmed = question.trim();
    if (!trimmed) {
        throw new Error("Question is empty");
    }

    const res = await fetch(ASK_ENDPOINT, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            file_id: fileId,
            question: trimmed,
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Request failed with status ${res.status}`);
    }

    const data = (await res.json().catch(() => ({}))) as AskResponseBody;
    const answer =
        typeof data.answer === "string"
            ? data.answer
            : data.answer?.answer ?? "";

    if (!answer) {
        throw new Error("No answer returned from server");
    }

    return {
        question: data.question ?? trimmed,
        fileId: data.file_id ?? fileId,
        message: data.message,
        answer,
    };
}


