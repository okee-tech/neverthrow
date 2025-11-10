import {
  Err,
  err,
  Result as GenericResult,
  type ResultAsync as GenericResultAsync,
} from "neverthrow";

export * from "neverthrow";

type ErrorInput = string | Error | unknown;
export type Result<T> = GenericResult<T, Error>;
export type ResultAsync<T> = GenericResultAsync<T, Error>;
export type { GenericResult, GenericResultAsync };

function createError<T>(error: ErrorInput, cause?: unknown): Err<T, Error> {
  let baseError: Error;

  if (error instanceof Error) baseError = error;
  else if (typeof error === "string") baseError = new Error(error);
  else baseError = new Error(JSON.stringify(error));

  if (error instanceof Error == false)
    Error.captureStackTrace(baseError, createError);

  let formattedCause: Error | undefined;
  if (cause !== undefined) {
    if (cause instanceof Error) formattedCause = cause;
    else if (typeof cause === "string") formattedCause = new Error(cause);
    else formattedCause = new Error(JSON.stringify(cause));

    if (cause instanceof Error == false)
      Error.captureStackTrace(formattedCause, createError);
  }

  if (formattedCause) baseError.cause = formattedCause;

  return err(baseError);
}

type FormattedError = {
  stack: string;
  cause?: FormattedError;
};
function logFormat(error: Error | Err<unknown, Error>): FormattedError {
  if (error instanceof Err) return logFormat(error.error);

  const formattedError: FormattedError = {
    stack: error.stack || "",
  };

  if (error.cause) formattedError.cause = logFormat(error.cause as Error);

  return formattedError;
}

export { createError, logFormat };
