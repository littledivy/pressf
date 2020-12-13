import { Context } from "../../pressf.ts";

/**
* Adapted from https://deno.land/x/abc@v1.2.3/middleware/logger.ts
**/

export type Formatter = (c: Context) => string;

const encoder = new TextEncoder();

export const DefaultFormatter: Formatter = (req) => {
  const time = new Date().toISOString();
  const method = req.method;
  const url = req.url || "/";
  const protocol = req.proto;

  return `${time} ${method} ${url} ${protocol}\n`;
};

export const DefaultLoggerConfig: LoggerConfig = {
  formatter: DefaultFormatter,
  output: Deno.stdout,
};

export default function logger(
  config: LoggerConfig = DefaultLoggerConfig,
) {
  if (config.formatter == null) {
    config.formatter = DefaultLoggerConfig.formatter;
  }
  if (config.output == null) {
    config.output = Deno.stdout;
  }
  return (c: Context) => {
    Deno.writeSync(config.output!.rid, encoder.encode(config.formatter!(c)));
  };
}

export interface LoggerConfig {
  formatter?: Formatter;
  // Default is Deno.stdout.
  output?: { rid: number };
}
