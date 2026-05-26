import { jsonSchema, tool, type ToolSet } from 'ai';

import { BoluoAgentKitError } from '../core/errors.js';
import {
  buildCapabilityCatalog,
  executeBoluoRuntimeOperation,
  getRuntimeInputJsonSchema,
  type BoluoRuntimeAuth,
} from '../runtime/index.js';

export type CreateBoluoAiSdkRuntimeInput = {
  auth?: BoluoRuntimeAuth;
};

export type BoluoAiSdkRuntime = {
  tools: ToolSet;
};

export function createBoluoAiSdkRuntime(
  input: CreateBoluoAiSdkRuntimeInput,
): BoluoAiSdkRuntime {
  // 运行时目录是工具暴露的唯一来源，避免线上服务手写业务接口规则。
  const catalog = buildCapabilityCatalog();

  // 只有存在 OpenAPI 鉴权且 schema 已就绪的能力，才允许暴露给 AI SDK。
  const allowedCapabilities = input.auth?.openApiKey
    ? catalog.filter((capability) => capability.schemaReady)
    : [];
  // 将 runtime catalog 中的能力逐个转换成 AI SDK tool，工具名沿用目录里的 toolName。
  const tools = Object.fromEntries(
    allowedCapabilities
      .map((capability) => [
        capability.toolName,
        tool({
          title: capability.usage,
          description: capability.usage,
          inputSchema: jsonSchema(getRuntimeInputJsonSchema(capability.ref)),
          execute: async (args) => {
            try {
              // execute 层继续二次校验鉴权，避免模型绕过上层运行时约束。
              return await executeBoluoRuntimeOperation({
                auth: input.auth,
                input: args as Record<string, unknown>,
                ref: capability.ref,
              });
            } catch (error) {
              return normalizeBoluoRuntimeError(error);
            }
          },
        }),
      ]),
  ) as ToolSet;

  return { tools };
}

function normalizeBoluoRuntimeError(error: unknown) {
  // 工具 execute 不把异常对象直接抛给模型，而是返回稳定错误结构。
  if (error instanceof BoluoAgentKitError) {
    return {
      ok: false,
      code: error.code,
      message: error.message,
      ...(error.status === undefined ? {} : { status: error.status }),
    };
  }

  return {
    ok: false,
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error && error.message
      ? error.message
      : '菠萝工具调用失败',
  };
}
