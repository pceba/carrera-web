/**
 * Minimal Server-Sent Events reader. All three providers stream `data: {json}` lines; blank
 * lines and `event:` lines carry nothing we need. Feed it text chunks as they arrive (a chunk may
 * end in the middle of a line); `onData` gets each payload once its line is complete.
 */
export function createSseParser(onData: (payload: string) => void) {
  let buffer = "";
  const flushLine = (line: string) => {
    const trimmed = line.replace(/\r$/, "");
    if (trimmed.startsWith("data:")) onData(trimmed.slice(5).trim());
  };
  return {
    feed(chunk: string) {
      buffer += chunk;
      let i: number;
      while ((i = buffer.indexOf("\n")) >= 0) {
        flushLine(buffer.slice(0, i));
        buffer = buffer.slice(i + 1);
      }
    },
    /** Call at the end of the stream: handles a last line without a trailing newline. */
    end() {
      if (buffer) flushLine(buffer);
      buffer = "";
    },
  };
}
