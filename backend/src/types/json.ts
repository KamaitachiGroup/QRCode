export type JSONValue = string | number | boolean | JSONObject | JSONArray;
export type JSONArray = Array<JSONValue>;
export type JSONObject = { [key: string]: JSONValue };