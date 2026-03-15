import morgan, { StreamOptions } from "morgan";
import fs from "fs";
import path from "path";

const logsDir = path.join(__dirname, "../../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
    flags: "a",
});

const errorLogStream: StreamOptions = {
    write: (message) =>
        fs.appendFileSync(path.join(logsDir, "error.log"), message),
};

const accessLogger = morgan("combined", { stream: accessLogStream });

const errorLogger = morgan("combined", {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400,
});

const consoleLogger = morgan("dev");

export { accessLogger, errorLogger, consoleLogger };
