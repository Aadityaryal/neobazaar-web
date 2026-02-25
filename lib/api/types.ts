import type { components } from "./generated/openapi";

export type ApiSuccessEnvelope = components["schemas"]["ApiSuccessEnvelope"];
export type ApiErrorEnvelope = components["schemas"]["ApiErrorEnvelope"];

export type ApiSuccess<TData = unknown> = Omit<ApiSuccessEnvelope, "data"> & { data: TData };
