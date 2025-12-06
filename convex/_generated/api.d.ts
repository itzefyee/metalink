/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_aiAnalysis from "../actions/aiAnalysis.js";
import type * as actions_auth from "../actions/auth.js";
import type * as actions_chat from "../actions/chat.js";
import type * as actions_generateCAD from "../actions/generateCAD.js";
import type * as actions_validateCompliance from "../actions/validateCompliance.js";
import type * as componentTaxonomy from "../componentTaxonomy.js";
import type * as drawingAnalyses from "../drawingAnalyses.js";
import type * as files from "../files.js";
import type * as materialSynonyms from "../materialSynonyms.js";
import type * as mcp_config from "../mcp/config.js";
import type * as mutations from "../mutations.js";
import type * as productEmbeddings from "../productEmbeddings.js";
import type * as productSpecs from "../productSpecs.js";
import type * as products from "../products.js";
import type * as queries from "../queries.js";
import type * as templates from "../templates.js";
import type * as validators_standards from "../validators/standards.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/aiAnalysis": typeof actions_aiAnalysis;
  "actions/auth": typeof actions_auth;
  "actions/chat": typeof actions_chat;
  "actions/generateCAD": typeof actions_generateCAD;
  "actions/validateCompliance": typeof actions_validateCompliance;
  componentTaxonomy: typeof componentTaxonomy;
  drawingAnalyses: typeof drawingAnalyses;
  files: typeof files;
  materialSynonyms: typeof materialSynonyms;
  "mcp/config": typeof mcp_config;
  mutations: typeof mutations;
  productEmbeddings: typeof productEmbeddings;
  productSpecs: typeof productSpecs;
  products: typeof products;
  queries: typeof queries;
  templates: typeof templates;
  "validators/standards": typeof validators_standards;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
