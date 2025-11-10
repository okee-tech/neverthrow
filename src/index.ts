import {
  Err as GenericErr,
  Ok as GenericOk,
  ResultAsync as GenericResultAsync,
  err,
  Result as GeneticResult,
} from "neverthrow";

export * from "neverthrow";

export class Ok<T> extends GenericOk<T, Error> {}
export class Err<T> extends GenericErr<T, Error> {}
export class ResultAsync<T> extends GenericResultAsync<T, Error> {}
export type Result<T> = Ok<T> | Err<T>;
export namespace Result {
  export const fromThrowable = GeneticResult.fromThrowable;
  export const fromAsyncThrowable = GeneticResult.combine;
  export const combineWithAllErrors = GeneticResult.combineWithAllErrors;
}

// Utility types
type ErrorInput = string | Error | unknown;

type FormattedError = {
  stack: string;
  cause?: FormattedError;
};

// Utility functions
function createError<T>(error: ErrorInput, cause?: unknown): Err<T> {
  let baseError: Error;

  if (error instanceof Error) {
    baseError = error;
  } else if (typeof error === "string") {
    baseError = new Error(error);
  } else {
    baseError = new Error(JSON.stringify(error));
  }

  if (!(error instanceof Error)) {
    Error.captureStackTrace(baseError, createError);
  }

  let formattedCause: Error | undefined;
  if (cause !== undefined) {
    if (cause instanceof Error) {
      formattedCause = cause;
    } else if (typeof cause === "string") {
      formattedCause = new Error(cause);
    } else {
      formattedCause = new Error(JSON.stringify(cause));
    }

    if (!(cause instanceof Error)) {
      Error.captureStackTrace(formattedCause, createError);
    }
  }

  if (formattedCause) {
    baseError.cause = formattedCause;
  }

  return err(baseError);
}

function logFormat(error: Error | Err<unknown>): FormattedError {
  if (error instanceof Err) {
    return logFormat(error.error);
  }

  const formattedError: FormattedError = {
    stack: error.stack || "",
  };

  if (error.cause) {
    formattedError.cause = logFormat(error.cause as Error);
  }

  return formattedError;
}

export { createError, logFormat };
export type { ErrorInput, FormattedError };
