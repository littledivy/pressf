import { Context } from "../../pressf.ts";

/**
* Adapted from https://deno.land/x/abc@v1.2.3/middleware/logger.ts
**/

type Formatter = (c: Context) => string;

export interface LoggerConfig {
  formatter: Formatter;
  output: { rid: number };
}

export const DefaultFormatter: Formatter = (ctx: Context) => {
  const time = new Date().toISOString();
  const method = ctx.method;
  const url = ctx.url || "/";
  const protocol = ctx.proto;

  return `${time} ${method} ${url} ${protocol}\n`;
};

export const DefaultLoggerConfig: LoggerConfig = {
  formatter: DefaultFormatter,
  output: Deno.stdout,
};

export default function logger(
  config: LoggerConfig = DefaultLoggerConfig,
) {
  return async (ctx: Context) =>
    await Deno.write(
      config.output.rid,
      new TextEncoder().encode(config.formatter(ctx)),
    );
}
