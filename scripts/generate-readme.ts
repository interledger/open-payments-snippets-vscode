import * as fs from "fs/promises";
import * as path from "path";
import { format, Config } from "prettier";

interface Snippet {
    prefix: string;
    description: string;
}

const snippetsFilePath = path.join(__dirname, "../snippets/snippets.json");
const packageJsonFilePath = path.join(__dirname, "../package.json");
const templateFilePath = path.join(__dirname, "../templates/readme.md");
const readMeFilePath = path.join(__dirname, "../README.md");
const tableArr = ["| Keyword | Description |\n", "|---------|-------------|\n"];

async function run() {
    const [snippetsContent, packageJsonContents, templateContent] =
        await Promise.all([
            fs.readFile(snippetsFilePath, "utf8"),
            fs.readFile(packageJsonFilePath, "utf8"),
            fs.readFile(templateFilePath, "utf8"),
        ]);

    const { prettier: prettierOptions } = JSON.parse(packageJsonContents) as {
        prettier: Config;
    };
    prettierOptions.parser = "markdown";

    const snippets = Object.values(JSON.parse(snippetsContent)) as Snippet[];
    for (const snippet of snippets) {
        tableArr.push(`| ${snippet.prefix} | ${snippet.description} |\n`);
    }

    const table = tableArr.join("");
    const content = templateContent.replace("{{ SNIPPETS-TABLE }}", table);
    const readMe = await format(content, prettierOptions);
    await fs.writeFile(readMeFilePath, readMe);
}

run().catch((err) => {
    console.log(err);
    process.exit(1);
});
