import * as fs from "fs/promises";
import * as path from "path";

interface Snippet {
    prefix: string;
    body: string[];
    description: string;
}

interface SnippetError {
    key: string;
    message: string;
}

const errors: SnippetError[] = [];
const snippetsFilePath = path.join(__dirname, "../snippets/snippets.json");

function isString(value: unknown): value is string {
    return typeof value === "string" && value.length !== 0;
}

function isCorrectPrefix(value: unknown): value is string {
    return isString(value) && value.startsWith("op-");
}

async function run() {
    const snippetsContent = await fs.readFile(snippetsFilePath, "utf8");
    const snippets = Object.entries<Snippet>(JSON.parse(snippetsContent));

    for (const [key, snippet] of snippets) {
        const { prefix, description } = snippet;
        if (!isString(key)) {
            errors.push({
                key: `${key}`,
                message: `Snippet key should be a string (non-empty).`,
            });
        }

        if (!isCorrectPrefix(prefix)) {
            errors.push({
                key: `${key}`,
                message: `Snippet prefix should be a string (non-empty) that starts with the "op-" prefix. Found: "${prefix}".`,
            });
        }

        if (!isString(description)) {
            errors.push({
                key: `${key}`,
                message: `Description should be a string (non-empty).`,
            });
        }
    }

    if (errors.length > 0) {
        console.log(
            `Found ${errors.length} error${errors.length === 1 ? "" : "s"}.\n`,
        );

        for (const error of errors) {
            console.error(`[KEY: ${error.key}] ${error.message}`);
        }
        process.exit(1);
    }
}

run().catch((err) => {
    console.log(err);
    process.exit(1);
});
