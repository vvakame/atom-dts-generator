import fs = require("fs");
import path = require("path");

import jsonpatch = require("json-patch");

var content = fs.readFileSync(path.resolve(__dirname, "../fixture/api.json"), "utf8");
var meta:AtomDocTypes.Metadata = JSON.parse(content);

// for compile passed
meta = jsonpatch.apply(meta, [
    // Config#onDidChange 3rd param to be optional
    {op: "add", path: "/classes/Config/instanceMethods/1/arguments/2/isOptional", value: true},
    // TextBuffer#transact 2nd param to be optional
    {op: "add", path: "/classes/TextBuffer/instanceMethods/52/arguments/1/isOptional", value: true},
    // TextEditor#transact 2nd param to be optional
    {op: "add", path: "/classes/TextEditor/instanceMethods/65/arguments/1/isOptional", value: true},
    // TextEditor#scan 3rd param to be optional
    {op: "add", path: "/classes/Workspace/instanceMethods/38/arguments/2/isOptional", value: true},
]);

// dive to more deeper... add type annotation details
meta = jsonpatch.apply(meta, [
]);


export = meta;
